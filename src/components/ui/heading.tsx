interface HeadingProps {
    title: string;
    description: string;
    smallTitle: boolean;
}

export const Heading: React.FC<HeadingProps> = ({
    title,
    description,
    smallTitle = true
}) => {
    return (
        <div>
            <h2 className={`${smallTitle ? `text-lg` : `text-xl`} font-medium tracking-tight`}>{title}</h2>
            <p className="text-sm text-muted-foreground mb-1">
                {description}
            </p>
        </div>
    );
};