<?php

namespace App\Http\Controllers;

use App\Services\Ai\CoachChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request, CoachChatService $coachChatService): Response
    {
        return Inertia::render('chat', [
            'chatContext' => $coachChatService->buildContextSnapshot($request->user()),
        ]);
    }

    public function reply(Request $request, CoachChatService $coachChatService): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1200'],
            'history' => ['sometimes', 'array', 'max:12'],
            'history.*.sender' => ['required_with:history', 'string', 'in:user,ai'],
            'history.*.text' => ['required_with:history', 'string', 'max:1200'],
        ]);

        $history = is_array($validated['history'] ?? null) ? $validated['history'] : [];

        $response = $coachChatService->respond(
            $request->user(),
            (string) $validated['message'],
            $history,
        );

        return response()->json($response);
    }
}
