# Charts & Metrics

The product exists to answer one question: **am I losing fat (measurements/bodyweight
down) without losing strength (key lifts flat or rising)?** Every chart maps to a real
question; nothing is decorative.

## Chart set

Phase 1 (core):
1. **Recomposition (hero)** — strength index vs. bodyweight, both indexed to 100, on one
   shared axis. The single chart that answers the core question.
2. **Per-workout exercise progression** — one line per exercise in a selected workout;
   value = session top set; lines toggleable; swap-aware (see below).
3. **Single-exercise drilldown** — one exercise; top-set line with a faint min–max band
   per session (shows working weight + fatigue drop-off). Per-set lines are an acceptable
   alternative if preferred later.
4. **Body** — smoothed bodyweight trend with rate; measurements (waist vs. muscle).
5. **Summary dashboard** — at-a-glance stat cards (bodyweight + weekly rate, waist trend,
   strength index, later calories). The default landing screen.

Phase 2 (Yazio):
6. **Calories vs. bodyweight** — rolling averages + TDEE back-calculation.
7. **Combined** — calories / bodyweight / strength as stacked panels sharing one time
   axis (never one chart with three axes).

Phase 3: training-frequency heatmap (polish).

## Metric definitions

### Top set (progression value)
Progression uses the **heaviest set of the session**, not the average of sets. Rationale:
averaging is sensitive to set count (doing 2 sets instead of 3 can raise the average, i.e.
less work looks like more), whereas the top set is robust to a missing/fatigue set. The
user trains a fixed rep target (~7–8, double progression: hold reps, raise load when
exceeded), so top-set weight at a steady rep target is a clean strength proxy. Expect
stair-stepped lines (flat then a jump), which is correct double progression. Average may
be offered as a toggle, but top set is the default.

> Reps are not tracked (deliberate — avoids cheat-rep temptation), so estimated 1RM is not
> available. Top-set weight is the best available proxy and is treated as a proxy, not a
> precise strength measure.

### Strength Index (per-workout aggregate)
Collapses a workout's exercises into one number to plot against bodyweight.

- For each exercise: `(current top set / baseline) * 100`.
- **Baseline is FIXED** = the average (or median, for outlier protection) of that
  exercise's **first 2–3 logged sessions**. Never a rolling baseline — a rolling baseline
  would always hover near 100 and hide the cumulative trend, defeating the chart.
- The workout's index = the average of its exercises' percentages, so a small lift's +10%
  counts equally to a big lift's +10%.
- An exercise **enters the index only once it has a baseline**, and **drops out when
  swapped away**, so a changing roster does not jolt the line.
- Optional: a short moving average may smooth the *displayed* index line. This is display
  smoothing only and is distinct from — and must not affect — the fixed baseline.

Present the Strength Index as a trend indicator, not gospel; chart 2 is where the user
confirms which specific lift moved.

### Recomposition indexing (hero chart)
Index **both** bodyweight and the strength index to 100 at the same baseline and plot on a
**single shared axis**. Never use dual y-axes — independent axis scales can manufacture or
hide a correlation. One line sliding down + one holding flat/up on one honest scale = the
app's thesis.

### Bodyweight
Daily weigh-ins are noisy (water, food, timing). Show raw points **plus a 7-day moving
average trend line**, and a **kg/week rate** readout. The trend, not the raw line, tells
the user if the deficit is working.

### Measurements
Independently timestamped, so bodyweight can be daily while circumferences are every few
weeks — charts plot whatever points exist. Bodyweight alone can't distinguish fat from
muscle loss, so circumferences matter: **waist (fat proxy, should fall) vs. biceps/chest
(muscle proxy, should hold)**, optionally normalized onto one axis — that comparison is
the most direct visual of "losing fat, keeping muscle."

### Exercise swap rendering
A swapped exercise is a **different catalog exercise**, so it is a **separate series**.
The old exercise's line ends; the new one's line begins (typically at a different weight).
There is **no bridging segment** between them. This is correct: it prevents reading an
attachment/exercise change as a strength regression. In the per-workout view, exercises are
toggleable, so the user usually views one line at a time anyway.

### Calories (Phase 2)
- **An untracked day is ABSENT, not zero.** Zero would crater the average and fake a huge
  deficit. The nutrition store holds records only for logged days; gaps are gaps.
- **Three states:** tracked-and-counted; flagged-incomplete; absent.
- **Incomplete-day handling:** days below a **configurable threshold** (e.g. a kcal floor
  or a percentage of target) are flagged "likely incomplete" and **excluded from averages
  BY DEFAULT**. The user can **re-include** a flagged day individually (genuine light day).
  Captures the partial-day case (e.g. logged breakfast + lunch, untracked restaurant
  dinner) without silently discarding real data.
- **Averages compute over tracked (counted) days only**, with a **coverage indicator**
  ("5 of 7 days") so partial-data averages aren't over-trusted.
- **Imprecision** (±100–200 from un-weighed ingredients) is tolerated by design: random
  errors wash out in a 7-day average, and the real arbiter is the weight-change rate.
- **TDEE back-calculation:** estimate maintenance from average intake + actual weekly
  weight change → tells the user concretely whether to eat more/less for a target loss
  rate. The **measured weight trend is ground truth**; logged calories are a directional
  input calibrated against it.

### Deliberately excluded
- **Training volume** (sets × reps × weight): needs reps (not tracked) and does not serve
  the "is strength holding?" question. Do not add it.
