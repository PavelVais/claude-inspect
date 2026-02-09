# MassUpdate Patterns

This document provides patterns and examples for creating optimized MassUpdate classes.

## Interface Definition

```php
<?php

declare(strict_types=1);

namespace Infrastructure\MassUpdate;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag(MassUpdate::class)]
interface MassUpdate
{
    public static function getName(): string;

    public function run(InputInterface $input, OutputInterface $output): int;
}
```

## Basic Class Structure

### One-Time Update (with Ticket Number)

```php
<?php

declare(strict_types=1);

namespace Infrastructure\MassUpdate;

use Doctrine\DBAL\Logging\Middleware as LoggingMiddleware;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\NullLogger;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

final class DGS{Number}{DescriptiveName}MassUpdate implements MassUpdate
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {
    }

    public static function getName(): string
    {
        return 'DGS-{number}-{descriptive-kebab-case}';
    }

    public function run(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // CRITICAL: Disable SQL logging for performance
        $this->em
            ->getConnection()
            ->getConfiguration()
            ->setMiddlewares([new LoggingMiddleware(new NullLogger())]);

        $io->section('Description of what this update does');

        // Implementation here

        $io->success('All done!');

        return Command::SUCCESS;
    }
}
```

### Repeatable Update (Generic Name)

```php
<?php

declare(strict_types=1);

namespace Infrastructure\MassUpdate;

use Doctrine\DBAL\Logging\Middleware as LoggingMiddleware;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\NullLogger;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

final readonly class {DescriptiveName}MassUpdate implements MassUpdate
{
    public function __construct(private EntityManagerInterface $em)
    {
    }

    public static function getName(): string
    {
        return '{descriptive-kebab-case}';
    }

    public function run(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // CRITICAL: Disable SQL logging for performance
        $this->em
            ->getConnection()
            ->getConfiguration()
            ->setMiddlewares([new LoggingMiddleware(new NullLogger())]);

        $io->title('Title of the mass update');

        // Implementation here

        $io->success('DONE');

        return Command::SUCCESS;
    }
}
```

## Performance Optimization Patterns

### 1. Disable SQL Logging (ALWAYS REQUIRED)

```php
$this->em
    ->getConnection()
    ->getConfiguration()
    ->setMiddlewares([new LoggingMiddleware(new NullLogger())]);
```

### 2. Use Iterable Queries for Large Datasets

```php
// Good - memory efficient
$query = $this->em->createQuery($dql);
foreach ($query->toIterable() as $entity) {
    // Process entity
}

// Bad - loads all into memory
$results = $query->getResult();
```

### 3. Batch Processing with Periodic Clear

```php
$batchSize = 100;
$i = 0;

foreach ($query->toIterable() as $entity) {
    // Process entity

    if (++$i % $batchSize === 0) {
        $this->em->flush();
        $this->em->clear();
        $io->writeln(sprintf('Processed %d entities...', $i));
    }
}

$this->em->flush();
```

### 4. Use DBAL for Simple Updates (More Efficient)

```php
// Simple UPDATE - use DBAL directly
$this->em->getConnection()->executeStatement(
    "UPDATE table_name SET column = :value WHERE condition = :condition",
    [
        'value' => $value,
        'condition' => $condition,
    ],
);

// Bulk SELECT - use DBAL
$ids = $this->em->getConnection()->fetchFirstColumn(
    "SELECT id FROM table_name WHERE condition = :condition",
    ['condition' => $condition],
);
```

### 5. Use Transactions for Related Operations

```php
$this->em->wrapInTransaction(static function (EntityManagerInterface $em) use ($data): void {
    // Multiple related operations
    $em->persist($entity1);
    $em->persist($entity2);
    $em->flush();
});
```

### 6. Use Query Builder for Complex Updates

```php
$this->em->createQueryBuilder()
    ->update(Entity::class, 'e')
    ->set('e.field', ':value')
    ->setParameter('value', $value)
    ->where('e.condition = :condition')
    ->setParameter('condition', $condition)
    ->getQuery()
    ->execute();
```

## Real Examples from Codebase

### Example 1: Using Commands with Iterable Processing

```php
final class CancelRecipientsOfDisapprovedEnvelopes implements MassUpdate
{
    use WithCommandBus;

    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {
    }

    public static function getName(): string
    {
        return 'DGS-2892-cancel-recipients-of-disapproved-envelopes';
    }

    public function run(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $this->em
            ->getConnection()
            ->getConfiguration()
            ->setMiddlewares([new LoggingMiddleware(new NullLogger())]);

        $io->section('Cancelling recipients of disapproved envelopes');

        $dql = '
            SELECT r FROM Core\Envelope\Domain\Entity\EnvelopeRecipient r
            JOIN r.envelope e
            WHERE e.status = :envelopeStatus
            AND r.status IN (:recipientStatuses)
        ';

        $query = $this->em->createQuery($dql)
            ->setParameter('envelopeStatus', EnvelopeStatus::DISAPPROVED)
            ->setParameter('recipientStatuses', RecipientStatus::ONGOING_STATUSES);

        /** @var EnvelopeRecipient $recipient */
        foreach ($query->toIterable() as $recipient) {
            $io->text('Canceling recipient: ' . $recipient->getId()->toString());
            $this->command(new TryCancelEnvelopeRecipient($recipient));
        }

        $this->em->flush();

        $io->success('All done!');

        return Command::SUCCESS;
    }
}
```

### Example 2: Using Transactions with ID List

```php
final readonly class CreateDefaultBrandingsMassUpdate implements MassUpdate
{
    public function __construct(private EntityManagerInterface $em)
    {
    }

    public static function getName(): string
    {
        return 'create-default-brandings';
    }

    public function run(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $this->em
            ->getConnection()
            ->getConfiguration()
            ->setMiddlewares([new LoggingMiddleware(new NullLogger())]);

        foreach ($this->getIds() as $id) {
            $io->writeln("Updating account $id");
            $this->em->wrapInTransaction(static function (EntityManagerInterface $em) use ($id): void {
                $account = $em->find(Account::class, $id) ?? throw new EntityNotFoundException();

                // Process account...

                $em->persist($account);
                $em->flush();

                // Additional query builder updates...
                $em->createQueryBuilder()
                    ->update(EnvelopeTemplate::class, 'et')
                    ->set('et.branding', ':branding')
                    ->setParameter('branding', $branding)
                    ->where('et.account = :account')
                    ->setParameter('account', $account)
                    ->getQuery()
                    ->execute();
            });
        }

        $io->success('DONE');

        return Command::SUCCESS;
    }

    /**
     * @return array<string>
     */
    private function getIds(): array
    {
        return $this->em->getConnection()->fetchFirstColumn(
            "SELECT account.id FROM account WHERE condition = true",
        );
    }
}
```

### Example 3: Direct DBAL Updates

```php
final readonly class PopulateEnvelopeTagWithMissingRecipients implements MassUpdate
{
    public function __construct(private EntityManagerInterface $em)
    {
    }

    public static function getName(): string
    {
        return 'populate-envelope-tag-with-missing-recipients';
    }

    public function run(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $this->em
            ->getConnection()
            ->getConfiguration()
            ->setMiddlewares([new LoggingMiddleware(new NullLogger())]);

        $io->title('Populate envelope tags with missing recipients');

        $pairs = $this->getPairs();
        foreach ($pairs as $tagId => $recipientId) {
            $io->writeln(sprintf("Updating tag %s with recipient %s", $tagId, $recipientId));
            $this->em->getConnection()->executeStatement(
                "UPDATE envelope_tag SET recipient_id = :recipient_id WHERE id = :tag_id",
                [
                    'recipient_id' => $recipientId,
                    'tag_id' => $tagId,
                ],
            );
        }

        $io->success(sprintf("Done (%s)", count($pairs)));

        return Command::SUCCESS;
    }

    /**
     * @return array<string, string>
     */
    private function getPairs(): array
    {
        /** @var array<string,string> */
        return $this->em->getConnection()->fetchAllKeyValue(
            "SELECT et.id, er.id as recipient_id
             FROM envelope_tag et
             JOIN envelope e ON e.id = et.envelope_id
             JOIN envelope_recipient er ON e.id = er.envelope_id
             WHERE et.recipient_id IS NULL",
        );
    }
}
```

## Common Imports

```php
use Core\Common\Command\WithCommandBus;  // When using commands
use Doctrine\DBAL\Exception;
use Doctrine\DBAL\Logging\Middleware as LoggingMiddleware;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\NullLogger;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
```

## Output Patterns

```php
// Section header
$io->section('Processing records');

// Title (large header)
$io->title('Mass Update Operation');

// Progress messages
$io->writeln("Processing item $id");
$io->text('Detailed message');

// Success
$io->success('All done!');
$io->success(sprintf("Processed %d items", $count));

// Warning
$io->warning('Some items could not be processed');

// Error
$io->error('Operation failed');
```

## Naming Conventions

### Class Names

| Type | Pattern | Example |
|------|---------|---------|
| One-time | `DGS{Number}{DescriptiveName}MassUpdate` | `DGS2892CancelRecipientsOfDisapprovedEnvelopesMassUpdate` |
| Repeatable | `{DescriptiveName}MassUpdate` | `CreateDefaultBrandingsMassUpdate` |

### Command Names (for `getName()`)

| Type | Pattern | Example |
|------|---------|---------|
| One-time | `DGS-{number}-{descriptive-kebab-case}` | `DGS-2892-cancel-recipients-of-disapproved-envelopes` |
| Repeatable | `{descriptive-kebab-case}` | `create-default-brandings` |

## Checklist for MassUpdate Creation

1. [ ] Class is `final` or `final readonly`
2. [ ] Implements `MassUpdate` interface
3. [ ] SQL logging disabled with `LoggingMiddleware(new NullLogger())`
4. [ ] Uses `toIterable()` for large queries
5. [ ] Periodic flush/clear for batch processing
6. [ ] Uses DBAL for simple updates when possible
7. [ ] Progress output with `SymfonyStyle`
8. [ ] Returns `Command::SUCCESS` or `Command::FAILURE`
9. [ ] Command name follows naming convention
10. [ ] Class name follows naming convention