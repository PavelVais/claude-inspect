# Add Subscription Flag

Creates a new subscription parameter (flag) to control feature availability in the system.

## Usage

```
/add-subscription-flag <flag_name> <description>
```

### Parameters
- `flag_name` - Flag name in camelCase (e.g. `identifyBankId`, `premiumFeature`)
- `description` - Description for migration (e.g. "Add premium feature flag")

### Example
```
/add-subscription-flag identifyBankId "Add identifyBankId parameter to subscription"
```

## What it does

This command automatically:

1. **Updates Subscription entity**:
   - Adds constant `UPPER_CASE_NAME = 'flagName'`
   - Adds private boolean property with ORM mapping and false default
   - Implements `isFlagName()` and `setFlagName()` methods
   - Adds logic to check across subscription items

2. **Updates SubscriptionItem entity**:
   - Adds constant and property same as Subscription
   - Implements getter/setter methods

3. **Updates StripeSubscriptionImporter**:
   - Adds constant `METADATA_FLAG_NAME = 'dgs_flag_name'`
   - Updates parsing for both subscription and product metadata
   - Adds setter calls in update methods

4. **Creates specification**:
   - Creates `AccountHasSubscriptionWith{FlagName}Enabled.php` 
   - Implements validation following existing specification patterns

5. **Generates migration**:
   - Uses `dsdev api migration` to auto-create migration from entity changes
   - Updates description with provided text and DGS ticket number from branch

## Implementation Notes

- Follows same patterns as existing subscription parameters (`branding`, `identify`, etc.)
- Automatically detects DGS ticket number from branch name for migration
- Creates consistent naming across all layers
- Integrates with billing system and Stripe metadata
- Generates UUID for error message in specification