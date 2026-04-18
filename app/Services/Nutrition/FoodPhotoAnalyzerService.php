<?php

namespace App\Services\Nutrition;

use App\Services\Ai\OpenAiClientService;
use RuntimeException;

class FoodPhotoAnalyzerService
{
    public function __construct(
        private readonly OpenAiClientService $openAiClient,
        private readonly \App\Services\Ai\PromptTemplateService $promptTemplateService,
    ) {
    }

    public function analyzeFromImage(string $absoluteImagePath, ?string $mealLabel = null): array
    {
        if (!is_file($absoluteImagePath)) {
            throw new RuntimeException('Food image file does not exist.');
        }

        $binary = file_get_contents($absoluteImagePath);

        if ($binary === false) {
            throw new RuntimeException('Could not read food image file.');
        }

        $mime = mime_content_type($absoluteImagePath);

        if (!is_string($mime) || $mime === '') {
            $mime = 'image/jpeg';
        }

        $dataUrl = sprintf('data:%s;base64,%s', $mime, base64_encode($binary));

        $systemPrompt = $this->promptTemplateService->load('ai/food-photo.system.txt');

        $textPrompt = $this->promptTemplateService->render('ai/food-photo.user.txt', [
            'meal_label' => $mealLabel ? trim($mealLabel) : 'unknown',
        ]);

        $payload = $this->openAiClient->chatJsonWithImage($systemPrompt, $textPrompt, $dataUrl);

        return $this->normalize($payload, $mealLabel);
    }

    private function normalize(array $payload, ?string $mealLabel): array
    {
        $required = [
            'mealName',
            'summary',
            'calories',
            'proteinGrams',
            'carbsGrams',
            'fatGrams',
            'recommendation',
        ];

        foreach ($required as $field) {
            if (!array_key_exists($field, $payload)) {
                throw new RuntimeException(sprintf('Food analysis is missing %s.', $field));
            }
        }

        $mealName = trim((string) $payload['mealName']);
        $summary = trim((string) $payload['summary']);
        $recommendation = trim((string) $payload['recommendation']);

        if ($mealName === '' || $summary === '' || $recommendation === '') {
            throw new RuntimeException('Food analysis contains empty required text fields.');
        }

        return [
            'mealName' => $mealName,
            'mealLabel' => $mealLabel ? trim($mealLabel) : null,
            'summary' => $summary,
            'calories' => max(0, (int) $payload['calories']),
            'proteinGrams' => max(0, (int) $payload['proteinGrams']),
            'carbsGrams' => max(0, (int) $payload['carbsGrams']),
            'fatGrams' => max(0, (int) $payload['fatGrams']),
            'fiberGrams' => isset($payload['fiberGrams']) ? max(0, (int) $payload['fiberGrams']) : null,
            'sugarGrams' => isset($payload['sugarGrams']) ? max(0, (int) $payload['sugarGrams']) : null,
            'sodiumMg' => isset($payload['sodiumMg']) ? max(0, (int) $payload['sodiumMg']) : null,
            'recommendation' => $recommendation,
            'detectedItems' => $this->normalizeStringList($payload['detectedItems'] ?? []),
            'confidence' => isset($payload['confidence']) ? max(0, min(100, (int) $payload['confidence'])) : null,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function normalizeStringList(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        $clean = [];

        foreach ($value as $item) {
            if (!is_string($item) || trim($item) === '') {
                continue;
            }

            $clean[] = trim($item);
        }

        return array_values(array_slice($clean, 0, 8));
    }
}
