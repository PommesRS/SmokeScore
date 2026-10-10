import React from 'react'
import { ToggleButtonGroup, ToggleButton, Box, Typography, useTheme } from '@mui/material'
import { SmokingRooms, Spa } from '@mui/icons-material'
import { useAppState } from '../../context/appState'

const ModeSwitcher = () => {
    const { counterVariant, setCounterVariantCig, setCounterVariantJoint } = useAppState()
    const theme = useTheme()

    const handleChange = (e, newState) => {
        if (newState === 1) {
            setCounterVariantCig()
        } else if (newState === 2) {
            setCounterVariantJoint()
        }
    }

  return (
    <ToggleButtonGroup
        value={counterVariant}
        exclusive
        onChange={handleChange}
        sx={{
            border: '0.5px solid rgba(217, 217, 217, 0.2)',
            bgcolor: theme.palette.background.paper,
            borderRadius: "10px",
            p: "6px",
            gap: "5px",
            flex: 1,
            "& .MuiToggleButtonGroup-grouped": {
                border: 0,
                borderRadius: "4px",
                textTransform: "none",
                color: "#ffff",
                flex: 1,
                py: 1.5,
                gap: 1,
                fontSize: "15px",
                fontWeight: 500,
                ":focus": {
                        outline: 'none'
                    },

                "&.Mui-selected": {
                    color: "#fff",
                    bgcolor: theme.palette.primary.main,

                    "&:hover": {
                    bgcolor: theme.palette.primary.main,
                    }
                },
            },
      }}
    >
        <ToggleButton value={1}>
            <SmokingRooms />
        </ToggleButton>
        <ToggleButton value={2}>
            <img src="./jointIcon.svg" alt="jointIcon" style={{ filter: 'invert(1)'}} />
        </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default ModeSwitcher