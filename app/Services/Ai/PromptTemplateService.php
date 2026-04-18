<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\File;
use RuntimeException;

class PromptTemplateService
{
    public function render(string $templatePath, array $variables = []): string
    {
        $content = $this->load($templatePath);
        $replacements = [];

        foreach ($variables as $key => $value) {
            $replacements[':' . $key] = $this->stringify($value);
        }

        return strtr($content, $replacements);
    }

    public function load(string $templatePath): string
    {
        $fullPath = resource_path('prompts/' . ltrim($templatePath, '/'));

        if (!File::exists($fullPath)) {
            throw new RuntimeException('Prompt template not found: ' . $templatePath);
        }

        return File::get($fullPath);
    }

    private function stringify(mixed $value): string
    {
        if (is_string($value)) {
            return $value;
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        if ($value === null) {
            return '';
        }

        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '';
        }

        if (is_object($value) && method_exists($value, '__toString')) {
            return (string) $value;
        }

        return (string) $value;
    }
}
