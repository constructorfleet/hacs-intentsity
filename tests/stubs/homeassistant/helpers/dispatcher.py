from __future__ import annotations

from collections import defaultdict
from typing import Any, Callable

from homeassistant.core import HomeAssistant

Listener = Callable[..., None]


def _get_dispatch_table(hass: HomeAssistant) -> dict[str, list[Listener]]:
    storage = hass.data.setdefault("__dispatcher__", defaultdict(list))
    return storage  # type: ignore[return-value]


def async_dispatcher_connect(hass: HomeAssistant, signal: str, target: Listener) -> Callable[[], None]:
    listeners = _get_dispatch_table(hass).setdefault(signal, [])
    listeners.append(target)

    def _remove() -> None:
        if target in listeners:
            listeners.remove(target)

    return _remove


def async_dispatcher_send(hass: HomeAssistant, signal: str, *args: Any) -> None:
    listeners = list(_get_dispatch_table(hass).get(signal, []))
    for listener in listeners:
        listener(*args)
