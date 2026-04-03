import { ArrowLeft, Info, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { showToast } from '@/utils/toast'
import { strategyApi } from '@/api/strategy'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PLATFORMS, TRADING_MODES } from '@/types/strategy'

const defaultFormData = {
  name: '',
  platform: '',
  strategy_type: 'intraday',
  trading_mode: 'LONG',
  start_time: '09:15',
  end_time: '15:00',
  squareoff_time: '15:15',
  instrument: '',
  expiry: '',
  strike: '',
  option_type: 'CE',
  order_type: 'NRML',
  price_type: 'Market',
  price: '',
  lots: '1',
  split_qty: '0',
  tgt_points: '',
  sl_type: 'MTM',
  sl_value: '',
  tsl_points: '',
  tsl_y: '',
  lock_profit: 'NO',
  lock_profit_trigger: '',
  lock_profit_min: '',
  trail_profit: 'NO',
  trail_profit_step: '',
  trail_profit_amount: '',
  reentry: 'YES',
  max_reentries: '0',
  rollover: 'DONT ROL',
  rollover_day: '',
  rollover_time: '',
  max_daily_signals: '0',
  remarks: '',
}

export default function NewStrategy() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ ...defaultFormData })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [symbols, setSymbols] = useState<string[]>([])
  const location = useLocation()

  useEffect(() => {
    // Guarantee that New Strategy always starts with a clean form state
    setFormData({ ...defaultFormData })
    setErrors({})
  }, [location.pathname])

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const syms = await strategyApi.getSymbols()
        if (syms.length > 0) {
          setSymbols(syms)
        } else {
          // Fallback to default symbols if master contract not downloaded
          setSymbols(['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'SBIN', 'RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK', 'AXISBANK'])
        }
      } catch (error) {
        console.error('Failed to fetch symbols', error)
        // Fallback to default symbols on error
        setSymbols(['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'SBIN', 'RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK', 'AXISBANK'])
      }
    }
    fetchSymbols()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Strategy name is required'
    } else if (formData.name.length < 3 || formData.name.length > 50) {
      newErrors.name = 'Name must be between 3 and 50 characters'
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters, numbers, spaces, hyphens, and underscores'
    }

    // Platform validation
    if (!formData.platform) {
      newErrors.platform = 'Please select a platform'
    }

    // Entry field validation
    if (!formData.instrument.trim()) {
      newErrors.instrument = 'Instrument is required'
    }

    if (!formData.lots || Number(formData.lots) < 1) {
      newErrors.lots = 'Lots must be at least 1'
    }

    if (Number(formData.max_daily_signals) < 0) {
      newErrors.max_daily_signals = 'Max daily signals cannot be negative'
    }

    // Time validation for intraday
    if (formData.strategy_type === 'intraday') {
      const start = formData.start_time
      const end = formData.end_time
      const squareoff = formData.squareoff_time

      if (!start || !end || !squareoff) {
        newErrors.time = 'All time fields are required for intraday strategies'
      } else if (start >= end) {
        newErrors.time = 'Start time must be before end time'
      } else if (end >= squareoff) {
        newErrors.time = 'End time must be before square off time'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast.error('Please fix the form errors', 'strategy')
      return
    }

    try {
      setLoading(true)
      const response = await strategyApi.createStrategy({
        name: formData.name,
        platform: formData.platform,
        strategy_type: formData.strategy_type as 'intraday' | 'positional',
        trading_mode: formData.trading_mode as 'LONG' | 'SHORT' | 'BOTH',
        start_time: formData.start_time,
        end_time: formData.end_time,
        squareoff_time: formData.squareoff_time,
        instrument: formData.instrument,
        expiry: formData.expiry,
        strike: formData.strike,
        option_type: formData.option_type as 'CE' | 'PE',
        order_type: formData.order_type as 'NRML' | 'MIS',
        price_type: formData.price_type as 'Market' | 'Limit',
        price: formData.price,
        lots: Number(formData.lots),
        split_qty: Number(formData.split_qty),
        tgt_points: formData.tgt_points,
        sl_type: formData.sl_type as 'MTM' | 'Fixed',
        sl_value: formData.sl_value,
        tsl_points: formData.tsl_points,
        tsl_y: formData.tsl_y,
        lock_profit: formData.lock_profit as 'YES' | 'NO',
        lock_profit_trigger: formData.lock_profit_trigger,
        lock_profit_min: formData.lock_profit_min,
        trail_profit: formData.trail_profit as 'YES' | 'NO',
        trail_profit_step: formData.trail_profit_step,
        trail_profit_amount: formData.trail_profit_amount,
        reentry: formData.reentry as 'YES' | 'NO',
        max_reentries: Number(formData.max_reentries),
        rollover: formData.rollover,
        rollover_day: formData.rollover_day,
        rollover_time: formData.rollover_time,
        max_daily_signals: Number(formData.max_daily_signals),
        remarks: formData.remarks,
      })

      if (response.status === 'success') {
        showToast.success('Strategy created successfully', 'strategy')
        navigate(`/strategy/${response.data?.strategy_id}`)
      } else {
        showToast.error(response.message || 'Failed to create strategy', 'strategy')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create strategy'
      showToast.error(errorMessage, 'strategy')
    } finally {
      setLoading(false)
    }
  }

  const finalName =
    formData.platform && formData.name
      ? `${formData.platform}_${formData.name.toLowerCase().replace(/\s+/g, '_')}`
      : ''

  return (
    <div className="container mx-auto py-6 max-w-2xl space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link to="/strategy">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Strategies
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Strategy</h1>
        <p className="text-muted-foreground">
          Set up a new webhook strategy to receive trading alerts
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Strategy Details
          </CardTitle>
          <CardDescription>Configure your webhook strategy settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Strategy Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Strategy Name</Label>
              <Input
                id="name"
                placeholder="My Trading Strategy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              <p className="text-xs text-muted-foreground">
                3-50 characters. Letters, numbers, spaces, hyphens, and underscores only.
              </p>
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger className={errors.platform ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.platform && <p className="text-sm text-red-500">{errors.platform}</p>}
            </div>

            {/* Final Name Preview */}
            {finalName && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Final strategy name:{' '}
                  <code className="bg-muted px-1 rounded font-mono">{finalName}</code>
                </AlertDescription>
              </Alert>
            )}

            {/* Strategy Type */}
            <div className="space-y-2">
              <Label htmlFor="strategy_type">Strategy Type</Label>
              <Select
                value={formData.strategy_type}
                onValueChange={(value) => setFormData({ ...formData, strategy_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intraday">Intraday</SelectItem>
                  <SelectItem value="positional">Positional</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Intraday strategies have trading hours and auto square-off.
              </p>
            </div>

            {/* Trading Mode */}
            <div className="space-y-2">
              <Label htmlFor="trading_mode">Trading Mode</Label>
              <Select
                value={formData.trading_mode}
                onValueChange={(value) => setFormData({ ...formData, trading_mode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {TRADING_MODES.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      <div className="flex flex-col">
                        <span>{mode.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {TRADING_MODES.find((m) => m.value === formData.trading_mode)?.description}
              </p>
            </div>

            {/* Strategy Orders */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">Entry Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instrument">Instrument</Label>
                  <Select
                    value={formData.instrument}
                    onValueChange={(value) => setFormData({ ...formData, instrument: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select instrument" />
                    </SelectTrigger>
                    <SelectContent>
                      {symbols.map((symbol) => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input
                    id="expiry"
                    type="text"
                    placeholder="e.g., Week 1"
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strike">Strike</Label>
                  <Input
                    id="strike"
                    placeholder="e.g., ITM1"
                    value={formData.strike}
                    onChange={(e) => setFormData({ ...formData, strike: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="option_type">Options Type</Label>
                  <Select
                    value={formData.option_type}
                    onValueChange={(value) => setFormData({ ...formData, option_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="PE">PE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order_type">Order Type</Label>
                  <Select
                    value={formData.order_type}
                    onValueChange={(value) => setFormData({ ...formData, order_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NRML">NRML</SelectItem>
                      <SelectItem value="MIS">MIS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_type">Price Type</Label>
                  <Select
                    value={formData.price_type}
                    onValueChange={(value) => setFormData({ ...formData, price_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Market">Market</SelectItem>
                      <SelectItem value="Limit">Limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lots">Lots</Label>
                  <Input
                    id="lots"
                    type="number"
                    min="1"
                    value={formData.lots}
                    onChange={(e) => setFormData({ ...formData, lots: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="split_qty">Split Qty</Label>
                  <Input
                    id="split_qty"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.split_qty}
                    onChange={(e) => setFormData({ ...formData, split_qty: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Risk Management */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">Risk Management</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tgt_points">TGT (Points)</Label>
                  <Input
                    id="tgt_points"
                    type="number"
                    value={formData.tgt_points}
                    onChange={(e) => setFormData({ ...formData, tgt_points: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sl_type">SL Type</Label>
                  <Select
                    value={formData.sl_type}
                    onValueChange={(value) => setFormData({ ...formData, sl_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTM">MTM</SelectItem>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sl_value">SL Value</Label>
                  <Input
                    id="sl_value"
                    type="number"
                    value={formData.sl_value}
                    onChange={(e) => setFormData({ ...formData, sl_value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tsl_points">TSL Points</Label>
                  <Input
                    id="tsl_points"
                    type="number"
                    value={formData.tsl_points}
                    onChange={(e) => setFormData({ ...formData, tsl_points: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tsl_y">Trail SL (Y)</Label>
                  <Input
                    id="tsl_y"
                    type="number"
                    value={formData.tsl_y}
                    onChange={(e) => setFormData({ ...formData, tsl_y: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lock_profit">Lock Profit</Label>
                  <Select
                    value={formData.lock_profit}
                    onValueChange={(value) => setFormData({ ...formData, lock_profit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO">NO</SelectItem>
                      <SelectItem value="YES">YES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lock_profit_trigger">Lock Profit Trigger</Label>
                  <Input
                    id="lock_profit_trigger"
                    type="number"
                    value={formData.lock_profit_trigger}
                    onChange={(e) => setFormData({ ...formData, lock_profit_trigger: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lock_profit_min">Lock Profit Min (₹)</Label>
                  <Input
                    id="lock_profit_min"
                    type="number"
                    value={formData.lock_profit_min}
                    onChange={(e) => setFormData({ ...formData, lock_profit_min: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trail_profit">Trail Profit</Label>
                  <Select
                    value={formData.trail_profit}
                    onValueChange={(value) => setFormData({ ...formData, trail_profit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO">NO</SelectItem>
                      <SelectItem value="YES">YES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trail_profit_step">Trail Step (X)</Label>
                  <Input
                    id="trail_profit_step"
                    type="number"
                    value={formData.trail_profit_step}
                    onChange={(e) => setFormData({ ...formData, trail_profit_step: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trail_profit_amount">Trail Amount (₹)</Label>
                  <Input
                    id="trail_profit_amount"
                    type="number"
                    value={formData.trail_profit_amount}
                    onChange={(e) => setFormData({ ...formData, trail_profit_amount: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">Additional Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reentry">Re-entry</Label>
                  <Select
                    value={formData.reentry}
                    onValueChange={(value) => setFormData({ ...formData, reentry: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">YES</SelectItem>
                      <SelectItem value="NO">NO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_reentries">Max Re-entries</Label>
                  <Input
                    id="max_reentries"
                    type="number"
                    min="0"
                    value={formData.max_reentries}
                    onChange={(e) => setFormData({ ...formData, max_reentries: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollover">Rollover</Label>
                  <Select
                    value={formData.rollover}
                    onValueChange={(value) => setFormData({ ...formData, rollover: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DONT ROL">DONT ROL</SelectItem>
                      <SelectItem value="ROLLOVER">ROLLOVER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollover_day">Rollover Day</Label>
                  <Input
                    id="rollover_day"
                    placeholder="e.g., Friday"
                    value={formData.rollover_day}
                    onChange={(e) => setFormData({ ...formData, rollover_day: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollover_time">Rollover Time</Label>
                  <Input
                    id="rollover_time"
                    type="time"
                    value={formData.rollover_time}
                    onChange={(e) => setFormData({ ...formData, rollover_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_daily_signals">Max Daily Signals</Label>
                  <Input
                    id="max_daily_signals"
                    type="number"
                    min="0"
                    value={formData.max_daily_signals}
                    onChange={(e) => setFormData({ ...formData, max_daily_signals: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <textarea
                  id="remarks"
                  className="w-full rounded border p-2"
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>
            </div>

            {/* Intraday Time Settings */}
            {formData.strategy_type === 'intraday' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">Trading Hours</h4>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="squareoff_time">Square Off</Label>
                    <Input
                      id="squareoff_time"
                      type="time"
                      value={formData.squareoff_time}
                      onChange={(e) => setFormData({ ...formData, squareoff_time: e.target.value })}
                    />
                  </div>
                </div>

                {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
                <p className="text-xs text-muted-foreground">
                  Orders will only be placed during trading hours. Positions will be squared off at
                  the specified time.
                </p>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/strategy')}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setFormData({ ...defaultFormData })
                  setErrors({})
                }}
              >
                Reset Form
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Creating...' : 'Create Strategy'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
