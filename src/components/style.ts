import { Theme } from '@mui/material/styles';

// Define the styles function that accepts the custom theme
const styles = (theme: Theme) => ({
  content_wrap: {
    maxWidth: '1440px',
    margin: '2em auto',
    padding: theme.spacing(2),
    boxSizing: 'border-box'
  },
  broadcast_wrap: {
    marginTop: theme.spacing(2), // Use spacing value from the custom theme
    // Add more styles here using values from the custom theme
  },
});

export default styles;
