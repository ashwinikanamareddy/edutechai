def calculate_confusion(hesitation_time, retries, hints_used, instability_score):
    score = (
        hesitation_time * 0.3 +
        retries * 10 +
        hints_used * 8 +
        instability_score * 0.4
    )

    return min(score, 100)
