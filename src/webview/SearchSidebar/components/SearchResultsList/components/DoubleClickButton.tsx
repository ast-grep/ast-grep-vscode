import {
  Button,
  ButtonProps,
  IconButton,
  Text,
  Tooltip,
  TooltipProps
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { IoIosWarning } from 'react-icons/io'

export function DoubleClickButton({
  confirmText = 'Click second time to confirm',
  onClick,
  icon,
  children,
  iconButton,
  tooltipPlacement,
  ...props
}: Omit<ButtonProps, 'rightIcon' | 'leftIcon'> & {
  confirmText?: string
  iconButton?: boolean
  icon?: ButtonProps['rightIcon']
  tooltipPlacement?: TooltipProps['placement']
}) {
  const [clicks, updateClicks] = useState(0)

  const clickedFirstTime = clicks === 1

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateClicks(0)
    }, 3000)

    return () => {
      clearTimeout(timeout)
    }
  }, [clicks])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    if (clicks >= 1) {
      onClick?.(event)
      updateClicks(0)
    } else {
      updateClicks(clicks + 1)
    }
  }

  const ButtonComponent = iconButton ? IconButton : Button

  return (
    <>
      <ButtonComponent
        aria-label="button"
        onClick={handleClick}
        {...props}
        {...{
          [iconButton ? 'icon' : 'rightIcon']: clickedFirstTime ? (
            <IoIosWarning />
          ) : (
            icon
          )
        }}
      >
        {children}
      </ButtonComponent>
      {clickedFirstTime && (
        <Tooltip
          label={confirmText}
          placement={tooltipPlacement}
          defaultIsOpen={true}
        >
          <span />
        </Tooltip>
      )}
    </>
  )
}
