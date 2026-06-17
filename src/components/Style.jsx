import React, { useState } from 'react'
import {
  Box,
  Stack,
  Typography,
  Button,
  useTheme,
  Divider,
  Paper,
  Popper,
  ClickAwayListener,
  Grid
} from '@mui/material'
import { Check, Add } from '@mui/icons-material'
import { LineChart, lineElementClasses, markElementClasses } from '@mui/x-charts/LineChart'
import { useAppTheme } from './ThemeProviderCustom'

// -------------------- //
// 🎨 Farbbutton
// -------------------- //
export function ColorButton({ color, onClick, size = 70, selected = false, uID }) {
  const { themeName } = useAppTheme()

  return (
    <Paper elevation={5} sx={{ borderRadius: 2 }}>
      <Button
        onClick={onClick}
        variant="contained"
        disableElevation
        sx={{
          width: size,
          height: size,
          minWidth: 0,
          borderRadius: 2,
          background: color,
          border: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: color,
            opacity: 0.9
          },
          ':focus': {
            outline: 'none',
            scale: selected ? '1.2' : '1'
          }
        }}
      >
        {selected && <Check fontSize="large" />}
      </Button>
    </Paper>
  )
}

// -------------------- //
// 💡 Hauptkomponente
// -------------------- //
const Style = () => {
  const { setThemeName, themeName } = useAppTheme()
  const theme = useTheme()

  const [anchorEls, setAnchorEls] = useState({})
  const [openPopperId, setOpenPopperId] = useState(null)

  const handlePopperToggle = (id) => (event) => {
    const newAnchor = event.currentTarget
    setAnchorEls((prev) => ({ ...prev, [id]: newAnchor }))
    setOpenPopperId((prevId) => (prevId === id ? null : id))
  }

  const handleClose = () => {
    setOpenPopperId(null)
  }

  const colorList = 
  [
    {
      color: 'blue',
      colorCode: '#53b0ee'
    },
    {
      color: 'sunset',
      colorCode: '#C7784A'
    },
    {
      color: 'purple',
      colorCode: '#aa14f0'
    },
    {
      color: 'red',
      colorCode: '#861f1f'
    },
    
    
  ]

  return (
    <Box
      pt={8}
      gap={5}
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Typography align="center" variant="h4">
        Farbstil
      </Typography>

      <ClickAwayListener onClickAway={handleClose}>
        <Stack direction="row" spacing={5} justifyContent="center">
          <Grid container spacing={5} justifyContent="center">
          {colorList.map((color) => (
            <Grid item>
            <Box position="relative">
              <ColorButton
                onClick={handlePopperToggle(color.color)}
                uID={color.color}
                color={color.colorCode}
                selected={themeName === color.color || themeName === 'gray' + color.color[0].toUpperCase() + color.color.slice(1)}
              />
              <Popper
                open={openPopperId === color.color}
                anchorEl={anchorEls[color.color]}
                placement="bottom"
                sx={{ zIndex: 100 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    mt: 2,
                    p: 2,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      width: 16,
                      height: 16,
                      top: -8,
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      bgcolor: 'background.paper'
                    },
                    boxShadow : '2px 5px 40px #000'
                  }}
                >
                  <Stack direction="row" gap={2}>
                    <ColorButton onClick={() => setThemeName(color.color)} uID={color.color} color={color.colorCode} />
                    <ColorButton onClick={() => setThemeName('gray' + color.color[0].toUpperCase() + color.color.slice(1))} uID={'gray' + color.color.toUpperCase()} color={`linear-gradient(135deg, ${color.colorCode} 50%, #252525 50%)`}/>
                  </Stack>
                </Paper>
              </Popper>
          </Box>

            </Grid>
          ))}
          </Grid>
        </Stack>
      </ClickAwayListener>

      {/* Vorschau-Box */}
      <Box border={1} borderRadius="10px" p={2} pb={0} mb={10} position="relative" height="50vh" width="inherit"
        sx={{
          '&::before': {
            content: '"Vorschau"',
            position: 'absolute',
            top: 0,
            transform: 'translateY(-50%)',
            bgcolor: 'background.default',
            p: '0 10px'
          }
        }}
      >
        <Stack gap={5} height="100%" width="100%">
          <Button
            sx={{
              border: 'none',
              height: '50px',
              width: '100%',
              borderRadius: '10px',
              background: theme.palette.background.gradient,
              ':focus': {
                outline: 'none'
              }
            }}
            variant="contained"
          >
            <Add fontSize="large" />
          </Button>

          <Box flex={1} minHeight={0}>
            <LineChart
              grid={{ horizontal: false }}
              series={[{ data: [5, 2, 3, 4, 9, 2, 6], area: true, color: '#fff' }]}
              margin={{ top: 10, bottom: 20 }}
              yAxis={[
                {
                  colorMap: {
                    type: 'continuous',
                    min: 0,
                    max: 9,
                    color: [theme.palette.primary.transparent02, theme.palette.primary.transparent05]
                  }
                }
              ]}
              xAxis={[
                {
                  scaleType: 'band',
                  data: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
                }
              ]}
              sx={{
                background: 'transparent',
                borderRadius: 4,
                py: 0,
                [`& .${lineElementClasses.root}`]: {
                  stroke: theme.palette.primary.main,
                  strokeWidth: 2
                },
                [`& .${markElementClasses.root}`]: {
                  stroke: theme.palette.primary.main,
                  scale: '0.6',
                  fill: 'transparent',
                  strokeWidth: 0
                }
              }}
            />
          </Box>

          <Divider />
        </Stack>
      </Box>
    </Box>
  )
}

export default Style
