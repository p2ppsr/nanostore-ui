import { Theme } from '@mui/material/styles';

// Define the styles function that accepts the custom theme
const styles = (theme: Theme) => ({
  content_wrap: {
    maxWidth: '1440px',
    margin: '2em auto',
    padding: theme.spacing(2),
    boxSizing: 'border-box'
  }
});

export default styles;
