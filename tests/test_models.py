from __future__ import annotations

from datetime import datetime, timezone

from custom_components.intentsity import models


def test_chat_message_validation() -> None:
    now = datetime(2025, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    msg = models.ChatMessage(
        timestamp=now,
        sender="user",
        text="Hello world",
        data={"some": "extra"}
    )
    assert msg.sender == "user"
    assert msg.text == "Hello world"
    assert msg.data == {"some": "extra"}


def test_chat_validation() -> None:
    now = datetime(2025, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    chat = models.Chat(
        created_at=now,
        conversation_id="conv-123",
        pipeline_run_id="run-1",
        run_timestamp=now,
        messages=[
            models.ChatMessage(
                timestamp=now,
                sender="user",
                text="Ping",
            ),
            models.ChatMessage(
                timestamp=now,
                sender="assistant",
                text="Pong",
            )
        ]
    )
    assert chat.conversation_id == "conv-123"
    assert chat.pipeline_run_id == "run-1"
    assert chat.run_timestamp == now
    assert len(chat.messages) == 2
    assert chat.messages[0].sender == "user"
    assert chat.messages[1].text == "Pong"
