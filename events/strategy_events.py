"""Events for strategy-related activities (signals, tradebook updates)."""

from dataclasses import dataclass

from events.base import OrderEvent


@dataclass
class StrategySignalEvent(OrderEvent):
    """Fired when incoming strategy webhook signal is received."""

    topic: str = "strategy.signal"
    strategy_id: int = 0
    strategy_name: str = ""
    symbol: str = ""
    action: str = ""
    position_size: float = 0.0
    risk_profile: str = ""
    account_id: str = ""
