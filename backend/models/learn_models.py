from pydantic import BaseModel
from typing import List, Optional

class LearnTopicRequest(BaseModel):
    topic: str
    language: str = "English"

class LearningQuickCheck(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str

class LessonData(BaseModel):
    subject: str
    topic: str
    grade: int
    explanation_html: str
    steps: List[str]
    real_life_example: str
    progress_percent: int = 0

class BehaviorData(BaseModel):
    hesitation: str = "Low"
    retry_count: int = 0
    hint_usage: int = 0
    language_switches: int = 0
    focus: str = "Good"

class FullLessonResponse(BaseModel):
    lesson: LessonData
    behavior: BehaviorData
    confusion_score: int
    quick_check: LearningQuickCheck

class LearnTopicResponse(BaseModel):
    explanation: str
    example: str
    key_points: List[str]
    summary: str

class TTSRequest(BaseModel):
    text: str
    language: str = "English"

class StoryboardResponse(BaseModel):
    scene_1: str
    scene_2: str
    scene_3: str
    scene_4: str
    scene_5: str
