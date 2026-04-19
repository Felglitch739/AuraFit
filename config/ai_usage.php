<?php

return [
    // Prices are USD per 1K tokens and can be tuned via env.
    'pricing_per_1k' => [
        'gpt-4o-mini' => [
            'input' => (float) env('OPENAI_GPT4O_MINI_INPUT_COST_PER_1K', 0.00017),
            'output' => (float) env('OPENAI_GPT4O_MINI_OUTPUT_COST_PER_1K', 0.00066),
        ],
        'gpt-5' => [
            'input' => (float) env('OPENAI_GPT5_INPUT_COST_PER_1K', 0.00125),
            'output' => (float) env('OPENAI_GPT5_OUTPUT_COST_PER_1K', 0.01000),
        ],
    ],

    'default_input_cost_per_1k' => (float) env('OPENAI_DEFAULT_INPUT_COST_PER_1K', 0.00015),
    'default_output_cost_per_1k' => (float) env('OPENAI_DEFAULT_OUTPUT_COST_PER_1K', 0.00060),
];
