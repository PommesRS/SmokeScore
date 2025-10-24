import React from 'react';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useAppTheme } from './ThemeProviderCustom';

export default function ThemeToggleButton() {
  const { themeName, setThemeName } = useAppTheme();

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        mt: 2,
        minWidth: 160,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
      }}
    >
      <InputLabel sx={{ color: '#fff' }}>Theme</InputLabel>
      <Select
        value={themeName}
        onChange={(e) => setThemeName(e.target.value)}
        label="Theme"
        sx={{
          color: '#fff',
          '.MuiSvgIcon-root': { color: '#fff' },
        }}
      >
        <MenuItem value="blue">Blau</MenuItem>
        <MenuItem value="green">Grün</MenuItem>
        <MenuItem value="sunset">Orange</MenuItem>
      </Select>
    </FormControl>
  );
}
