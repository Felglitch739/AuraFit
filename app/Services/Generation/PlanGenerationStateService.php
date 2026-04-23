<?php

namespace App\Services\Generation;

use App\Models\User;

class PlanGenerationStateService
{
    public const STATUS_IDLE = 'idle';
    public const STATUS_QUEUED = 'queued';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_FAILED = 'failed';

    public function queue(User $user, string $kind, string $message): void
    {
        $this->updateState($user, self::STATUS_QUEUED, $kind, $message);
    }

    public function start(User $user, string $kind, string $message): void
    {
        $this->updateState($user, self::STATUS_PROCESSING, $kind, $message);
    }

    public function progress(User $user, string $kind, string $message): void
    {
        $this->updateState($user, self::STATUS_PROCESSING, $kind, $message);
    }

    public function fail(User $user, string $kind, string $message): void
    {
        $user->forceFill([
            'generation_status' => self::STATUS_FAILED,
            'generation_kind' => $kind,
            'generation_message' => $message,
            'generation_failed_at' => now(),
        ])->saveQuietly();
    }

    public function clear(User $user): void
    {
        $user->forceFill([
            'generation_status' => self::STATUS_IDLE,
            'generation_kind' => null,
            'generation_message' => null,
            'generation_started_at' => null,
            'generation_failed_at' => null,
        ])->saveQuietly();
    }

    /**
     * @return array{status: string, kind: ?string, message: ?string, startedAt: ?string, failedAt: ?string}
     */
    public function toViewModel(?User $user): array
    {
        if (!$user) {
            return [
                'status' => self::STATUS_IDLE,
                'kind' => null,
                'message' => null,
                'startedAt' => null,
                'failedAt' => null,
            ];
        }

        return [
            'status' => (string) ($user->generation_status ?? self::STATUS_IDLE),
            'kind' => $user->generation_kind,
            'message' => $user->generation_message,
            'startedAt' => $user->generation_started_at?->toIso8601String(),
            'failedAt' => $user->generation_failed_at?->toIso8601String(),
        ];
    }

    private function updateState(User $user, string $status, string $kind, string $message): void
    {
        $user->forceFill([
            'generation_status' => $status,
            'generation_kind' => $kind,
            'generation_message' => $message,
            'generation_started_at' => $user->generation_started_at ?? now(),
            'generation_failed_at' => null,
        ])->saveQuietly();
    }
}
