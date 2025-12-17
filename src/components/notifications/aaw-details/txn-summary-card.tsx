"use client"
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AddressPair {
  fromAddress: string;
  toAddress: string;
}

interface TxnSummaryCardProps {
  groupingKey: string;
  groupingType: 'asset' | 'category';
  count: number;
  addresses: AddressPair[];
  onCardClick: (key: string) => void;
  isActive: boolean;
}

const TruncatedPair = ({
  from,
  to,
}: {
  from: string;
  to: string;
}) => {
  const truncate = (addr: string) =>
    addr.length > 20
      ? `${addr.slice(0, 6)}...${addr.slice(-4)}`
      : addr;

  return (
    <p
      className="text-xs font-mono text-muted-foreground truncate"
      title={`${from} - ${to}`}
    >
      {truncate(from)} - {truncate(to)}
    </p>
  );
};


export default function TxnSummaryCard({
  groupingKey,
  groupingType,
  count,
  addresses,
  onCardClick,
  isActive,
}: TxnSummaryCardProps) {

  return (
    <Card
      onClick={() => onCardClick(groupingKey)}
      className={`
        cursor-pointer h-40 flex flex-col border-2 transition-colors py-0 gap-0
        ${isActive
          ? 'border-primary bg-primary/10 shadow-lg'
          : 'border-border hover:border-muted-foreground/50'
        }
      `}
    >
      {/* Header */}
      <CardHeader className="px-4 py-2 gap-0 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg truncate max-w-[70%]">
            {groupingKey}
          </CardTitle>

          <Badge variant="secondary" className="h-5 text-xs">
            {groupingType}
          </Badge>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="px-4 py-1 pt-0 flex flex-col flex-grow">
        <p className="text-xl font-bold">
          {count} events
        </p>

        {/* Address Pairs Section */}
        <div className="pt-1 border-t border-border/70 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Involved Addresses
          </p>

          {addresses.slice(0, 2).map((pair, index) => (
            <TruncatedPair
              key={`${pair.fromAddress}-${pair.toAddress}-${index}`}
              from={pair.fromAddress}
              to={pair.toAddress}
            />
          ))}

          {count > 2 ? (
            <p className="text-xs font-medium text-primary/80">
              +{count - 2} more
            </p>
          ) : (
            count === 1 && <div className="h-[14px]" />
          )}
        </div>

      </CardContent>
    </Card>
  );
}
