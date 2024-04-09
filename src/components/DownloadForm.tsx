import React, { FormEvent, useState } from 'react';
import { Button, LinearProgress, Grid, TextField, Typography } from '@mui/material'
import { CloudDownload } from '@mui/icons-material'
import { toast } from 'react-toastify';
import { download } from 'nanoseek';
import constants from '../utils/constants';

interface DownloadFormProps {}

const DownloadForm: React.FC<DownloadFormProps> = () => {
  const [confederacyURL, setConfederacyURL] = useState(constants.confederacyURL);
  const [downloadURL, setDownloadURL] = useState('');
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [loading, setLoading] = useState(false);

	console.log('confederacyURL=', confederacyURL.href)
	
  const handleDownload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
		try {
			const { mimeType, data } = await download({
				UHRPUrl: downloadURL?.toString() || '',
				confederacyURL,
			});
	
			const blob = new Blob([data], { type: mimeType });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
	
			// Assign the download attribute with the filename (using downloadURL or a default value)
			link.download = downloadURL?.toString() || 'download';
	
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			toast.error('An error occurred during download');
		} finally {
			setLoading(false);
		}  };

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
					<TextField
						fullWidth
						variant="outlined"
						label="Confederacy Resolver URL"
						value={confederacyURL}
						onChange={(e) => setConfederacyURL(new URL(e.target.value.toString()))}
					/>
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
						disabled={loading}
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
  )
}

export default DownloadForm;
