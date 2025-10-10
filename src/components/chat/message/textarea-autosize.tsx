import { cn } from "@/lib/utils"
import { FC } from "react"
import ReactTextareaAutosize from "react-textarea-autosize"
import { TextareaAutosize as TextareaAutosizeMui } from "@mui/material"
import { styled } from '@mui/system';

interface TextareaAutosizeProps {
  value: string
  onValueChange: (value: string) => void
  className?: string

  placeholder?: string
  minRows?: number
}

const StyledTextarea = styled(TextareaAutosizeMui)`
  width: 100%; /* Set a fixed width */
  resize: none; /* Disable user resizing */
  overflow-y: scroll; /* Enable vertical scrolling */

  /* You can add more Material UI-style properties here for styling */
  border: none;
  border-radius: 0px;
  padding: 8px;
`;

export const TextareaAutosize: FC<TextareaAutosizeProps> = ({
  value,
  onValueChange,
  className,
  placeholder = "",
  minRows = 1
}) => {
  console.log(value);
  return (
    <StyledTextarea
      className={cn(
        "bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-none rounded-md border-2 px-3 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      minRows={minRows}
      placeholder={placeholder}
      value={value}
      onChange={event => onValueChange(event.target.value)}
    />
  )
}
