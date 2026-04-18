<?php

namespace App\Services\Ai;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
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
        $apiKey = (string) config('services.openai.api_key');

        if ($apiKey === '') {
            throw new RuntimeException('OPENAI_API_KEY is not configured.');
        }

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

        $response = Http::baseUrl((string) config('services.openai.base_url', 'https://api.openai.com/v1'))
            ->timeout((int) config('services.openai.timeout', 30))
            ->withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->post('/chat/completions', $payload)
            ->throw();

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
     * @throws ConnectionException
     * @throws RequestException
     */
    public function chatJsonWithImage(string $systemPrompt, string $userPrompt, string $imageDataUrl): array
    {
        $apiKey = (string) config('services.openai.api_key');

        if ($apiKey === '') {
            throw new RuntimeException('OPENAI_API_KEY is not configured.');
        }

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

        $response = Http::baseUrl((string) config('services.openai.base_url', 'https://api.openai.com/v1'))
            ->timeout((int) config('services.openai.timeout', 30))
            ->withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->post('/chat/completions', $payload)
            ->throw();

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
}
