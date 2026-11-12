# Hotel pricing — story #57

`Game` has many `GameHotel` records (`game_hotels`), each with many
`HotelRate` records (`hotel_rates`). Prices are per room, per night, shared
across NSOs in the same game. This reference table does not change Cost Summary.
The hotel table has no currency conversion or currency selector.

The calculator renders Estimated Costs, the database-backed Hotel Pricing table,
and Cost Summary in that order. Cost Summary uses saved per-person calculator
budgets multiplied by team size, plus saved cellphone costs multiplied by
traveler-days. Clothing is shown separately and excluded from the estimated
total. Calculator and Estimated Costs amounts are kept in CAD and converted for
display using the existing currency selector. Hotel reference rates do not feed
these totals. Calculator and Estimated Costs saves remain local UI state; the
summary action buttons remain disabled until their workflows are implemented.

Hotel names are VARCHAR(255); occupancy is VARCHAR(50). Rates use DECIMAL(12,2).
The migration enforces nonnegative amounts, single/double/triple occupancy,
foreign keys, and one rate per hotel/occupancy. Deletion is restricted.
UUID defaults and updated timestamps are managed by Prisma; non-Prisma import
clients must supply IDs and updated timestamps. Hotel ordering is display order,
name, then ID. Missing rates display a dash; zero is a valid rate.

The calculator server page uses the existing session/game queries to validate
access and NSO participation. `getHotelPricing` reads only the selected game's
hotels and serializes Decimal amounts as strings. The existing read-only grid
receives those records through a streamed server component. Game keys prevent
stale grid state after navigation. Empty and database-error states never use mock
prices. Authentication currently follows the existing mocked session provider;
this feature does not implement production authentication.

## Deployment and population

Review `20261110120000_add_hotel_pricing` with the team. Before deployment,
confirm the target database's migration history and that these tables do not
already exist. Test on isolated PostgreSQL first. An authorized maintainer can
apply the checked-in migrations through the team's approved deployment process,
using `prisma migrate deploy --config prisma7.config.ts`, then generate the client
using `prisma generate --config prisma7.config.ts`. Never use reset, db push, or
the destructive development seed against shared Supabase.

No hotel records are seeded by this change. An authorized maintainer must supply
approved names and rates for the correct existing game IDs through a reviewed
import or administration process. Do not copy placeholder prices into Supabase.
Coordinate with `feature/calculator-db-hibat` when integrating its calculator
page and schema changes; preserve the hotel section and both sets of models.
