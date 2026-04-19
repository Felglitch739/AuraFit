<?php

namespace App\Services\Ai;

use App\Models\ApiUsageLog;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OpenAiClientService
{
    /**
     * @throws ConnectionException
     * @throws RequestException
     */
    public function chatJson(string $systemPrompt, string $userPrompt): array
    {
        $payload = [
            'model' => config('services.openai.model', 'gpt-5'),
            'temperature' => 0.2,
            'response_format' => [
                'type' => 'json_object',
            ],
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ],
                [
                    'role' => 'user',
                    'content' => $userPrompt,
                ],
            ],
        ];

        return $this->performChatCompletion($payload, ['mode' => 'text']);
    }

    /**
     * @throws ConnectionException
     * @throws RequestException
     */
    public function chatJsonWithImage(string $systemPrompt, string $userPrompt, string $imageDataUrl): array
    {
        $payload = [
            'model' => config('services.openai.model', 'gpt-5'),
            'temperature' => 0.2,
            'response_format' => [
                'type' => 'json_object',
            ],
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ],
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => $userPrompt,
                        ],
                        [
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => $imageDataUrl,
                            ],
                        ],
                    ],
                ],
            ],
        ];

        return $this->performChatCompletion($payload, ['mode' => 'image']);
    }

    /**
     * @param array<string, mixed> $payload
     * @param array<string, mixed> $meta
     * @throws ConnectionException
     * @throws RequestException
     */
    private function performChatCompletion(array $payload, array $meta = []): array
    {
        $apiKey = (string) config('services.openai.api_key');

        if ($apiKey === '') {
            throw new RuntimeException('OPENAI_API_KEY is not configured.');
        }

        $model = (string) ($payload['model'] ?? config('services.openai.model', 'gpt-5'));

        try {
            $response = Http::baseUrl((string) config('services.openai.base_url', 'https://api.openai.com/v1'))
                ->timeout((int) config('services.openai.timeout', 30))
                ->withToken($apiKey)
                ->acceptJson()
                ->asJson()
                ->post('/chat/completions', $payload)
                ->throw();
        } catch (ConnectionException $exception) {
            $this->logUsage(
                model: $model,
                response: null,
                succeeded: false,
                errorCode: 'connection_error',
                errorMessage: $exception->getMessage(),
                meta: $meta,
            );

            throw $exception;
        } catch (RequestException $exception) {
            $response = $exception->response;

            $this->logUsage(
                model: $model,
                response: $response,
                succeeded: false,
                errorCode: (string) data_get($response?->json() ?? [], 'error.code', ''),
                errorMessage: (string) data_get($response?->json() ?? [], 'error.message', $exception->getMessage()),
                meta: $meta,
            );

            throw $exception;
        }

        $this->logUsage(
            model: $model,
            response: $response,
            succeeded: true,
            errorCode: null,
            errorMessage: null,
            meta: $meta,
        );

        $content = data_get($response->json(), 'choices.0.message.content');

        if (!is_string($content) || trim($content) === '') {
            throw new RuntimeException('OpenAI returned an empty response content.');
        }

        $decoded = json_decode($content, true);

        if (!is_array($decoded)) {
            throw new RuntimeException('OpenAI response content is not valid JSON.');
        }

        return $decoded;
    }

    /**
     * @param array<string, mixed> $meta
     */
    private function logUsage(
        string $model,
        ?Response $response,
        bool $succeeded,
        ?string $errorCode,
        ?string $errorMessage,
        array $meta = [],
    ): void {
        $usage = $response?->json('usage') ?? [];
        $promptTokens = max(0, (int) data_get($usage, 'prompt_tokens', 0));
        $completionTokens = max(0, (int) data_get($usage, 'completion_tokens', 0));
        $totalTokens = max(0, (int) data_get($usage, 'total_tokens', $promptTokens + $completionTokens));

        [$inputPer1k, $outputPer1k] = $this->pricingForModel($model);
        $estimatedCost = (($promptTokens / 1000) * $inputPer1k) + (($completionTokens / 1000) * $outputPer1k);

        ApiUsageLog::query()->create([
            'user_id' => auth()->id(),
            'provider' => 'openai',
            'service' => 'chat.completions',
            'model' => $model,
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
            'total_tokens' => $totalTokens,
            'estimated_cost_usd' => $estimatedCost,
            'http_status' => $response?->status(),
            'succeeded' => $succeeded,
            'error_code' => $errorCode,
            'error_message' => $errorMessage,
            'meta' => $meta,
        ]);
    }

    /**
     * @return array{0: float, 1: float}
     */
    private function pricingForModel(string $model): array
    {
        $pricing = config('ai_usage.pricing_per_1k', []);
        $modelPricing = $pricing[$model] ?? null;

        if (is_array($modelPricing) && isset($modelPricing['input'], $modelPricing['output'])) {
            return [
                (float) $modelPricing['input'],
                (float) $modelPricing['output'],
            ];
        }

        return [
            (float) config('ai_usage.default_input_cost_per_1k', 0.00015),
            (float) config('ai_usage.default_output_cost_per_1k', 0.00060),
        ];
    }
}
