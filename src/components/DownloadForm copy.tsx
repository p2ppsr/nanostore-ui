import React, { FormEvent, useState, useEffect } from 'react';
import {
  Button,
  LinearProgress,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { CloudDownload } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { download } from 'nanoseek';
import constants from '../utils/constants';
import { SelectChangeEvent } from '@mui/material';

interface DownloadFormProps {}

const DownloadForm: React.FC<DownloadFormProps> = () => {
  const [confederacyURL, setConfederacyURL] = useState<string>('');
  const [downloadURL, setDownloadURL] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [inputsValid, setInputsValid] = useState<boolean>(false);
  const [newOption, setNewOption] = useState<string>('');

  useEffect(() => {
    setInputsValid(confederacyURL.trim() !== '' && downloadURL.trim() !== '');
  }, [confederacyURL, downloadURL]);

  useEffect(() => {
    // Initialize confederacyURL with the first URL from constants.confederacyURLs
    if (constants.confederacyURLs && constants.confederacyURLs.length > 0) {
      setConfederacyURL(constants.confederacyURLs[0].toString());
    }
    
  }, []); // Run this effect only once on component mount

  const handleDownload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { mimeType, data } = await download({
        UHRPUrl: downloadURL.trim() || '',
        confederacyURL: confederacyURL.trim(),
      });
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadURL.trim() || 'download';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('An error occurred during download');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value;
    setConfederacyURL(selectedValue);
  };

  const handleAddOption = () => {
    if (newOption.trim() !== '') {
      setConfederacyURL(newOption); // Set the newly added option as the selected value
      setNewOption(''); // Clear the new option input field
    }
  };

  return (
    <form onSubmit={handleDownload}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Download Form</Typography>
          <Typography color="textSecondary" paragraph>
            Download files from NanoStore
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Confederacy Resolver URL</InputLabel>
            <Select style={{ marginTop: '16px' }}
              value={confederacyURL}
              onChange={handleSelectChange}
              label="Confederacy Resolver URL"
            >
              {constants.confederacyURLs.map((url) => (
                <MenuItem key={url.toString()} value={url.toString()}>
                  {url.toString()}
                </MenuItem>
              ))}
            </Select>
            {/* Render TextField for adding new option */}
            <TextField
              fullWidth
              variant="outlined"
              label="Add your Confederacy option"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddOption();
                }
              }}
              style={{ marginTop: '8px' }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="UHRP URL"
            value={downloadURL}
            onChange={(e) => setDownloadURL(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            disabled={loading || !inputsValid}
            startIcon={<CloudDownload />}
          >
            Download
          </Button>
          {loading && (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          )}
        </Grid>
      </Grid>
    </form>
  );
};

export default DownloadForm;
