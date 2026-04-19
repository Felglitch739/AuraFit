<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use App\Services\Notifications\WebPushNotificationService;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AdminPushNotificationController extends Controller
{
    public function store(Request $request, WebPushNotificationService $webPush): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:daily,smart,workout'],
        ]);

        $type = $validated['type'];

        $templates = [
            'daily' => [
                'title' => 'Daily Reminder',
                'body' => 'Time to do your check-in',
                'url' => '/check-in',
            ],
            'smart' => [
                'title' => 'Smart Reminder',
                'body' => "We haven't seen you today. How are you feeling?",
                'url' => '/check-in',
            ],
            'workout' => [
                'title' => 'Workout Ready',
                'body' => 'Your personalized workout is ready',
                'url' => '/dashboard',
            ],
        ];

        $query = PushSubscription::query()->with('user');

        if ($type === 'smart') {
            $today = CarbonImmutable::today();
            $query->whereHas('user', function ($userQuery) use ($today) {
                $userQuery->whereDoesntHave('dailyLogs', function ($dailyLogQuery) use ($today) {
                    $dailyLogQuery->whereDate('created_at', $today);
                });
            });
        }

        $subscriptions = $query->get();

        if ($subscriptions->isEmpty()) {
            return back()->withErrors([
                'admin_push' => 'No matching push subscriptions found.',
            ]);
        }

        $template = $templates[$type];

        $stats = $webPush->send(
            subscriptions: $subscriptions,
            title: $template['title'],
            body: $template['body'],
            data: [
                'type' => $type,
                'url' => $template['url'],
                'sent_at' => now()->toIso8601String(),
                'triggered_by' => $request->user()->id,
            ],
        );

        return back()->with('success', sprintf(
            'Push dispatched: %s | delivered %d / %d | failed %d',
            $type,
            $stats['successful'],
            $stats['attempted'],
            $stats['failed'],
        ));
    }
}
