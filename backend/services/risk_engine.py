def calculate_risk(mastery, confusion, engagement):
    if mastery < 50 and confusion > 70:
        return "High"

    if mastery < 65 or confusion > 60 or engagement < 50:
        return "Medium"

    return "Low"
