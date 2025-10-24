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
  ClickAwayListener
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
          <ColorButton onClick={() => {setThemeName('blue'); handleClose()}} uID="blue" color="#53b0ee" selected={themeName === 'blue'} />
          <ColorButton onClick={() => {setThemeName('green'); handleClose()}} uID="green" color="#187" selected={themeName === 'green'} />
          <ColorButton onClick={() => {setThemeName('sunset'); handleClose()}} uID="sunset" color="#C7784A" selected={themeName === 'sunset'} />

          {/* Popper-Button 1 */}
          <Box position="relative">
            <ColorButton
              onClick={handlePopperToggle('purple')}
              uID="purple"
              color="#aa14f0"
              selected={themeName === 'purple' || themeName === 'grayPurple'}
            />
            <Popper
              open={openPopperId === 'purple'}
              anchorEl={anchorEls['purple']}
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
                  <ColorButton onClick={() => setThemeName('purple')} uID="purple" color="#aa14f0" />
                  <ColorButton onClick={() => setThemeName('grayPurple')} uID="grayPurple" color="linear-gradient(135deg, #aa14f0 50%, #252525 50%)"/>
                </Stack>
              </Paper>
            </Popper>
          </Box>

          {/* Popper-Button 2 */}
          <Box position="relative">
            <ColorButton
              onClick={handlePopperToggle('red')}
              uID="red"
              color="#861f1f"
              selected={ themeName === 'red' || themeName === 'grayRed'}
            />
            <Popper
              open={openPopperId === 'red'}
              anchorEl={anchorEls['red']}
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
                  <ColorButton onClick={() => setThemeName('red')} uID="red" color="#861f1f" />
                  <ColorButton onClick={() => setThemeName('grayRed')} uID="grayRed" color="linear-gradient(135deg, #861f1f 50%, #252525 50%)" />
                </Stack>
              </Paper>
            </Popper>
          </Box>
        </Stack>
      </ClickAwayListener>

      {/* Vorschau-Box */}
      <Box
        border={1}
        borderRadius="10px"
        p={2}
        pb={0}
        mb={10}
        position="relative"
        height="50vh"
        width="inherit"
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
