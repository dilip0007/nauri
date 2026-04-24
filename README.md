# Naukri Profile Auto-Updater

An automated Node/Playwright script to routinely update your Naukri profile's "Resume Headline", propelling your profile to the top of recruiter searches by registering daily activity.

## Why Run Locally?
Naukri uses enterprise firewall security (Akamai WAF) to block logins originating from major data centers (like GitHub Actions, AWS, Azure, etc.). Trying to run this via GitHub Actions will often result in a silent block or timeout.

By running this script directly on your **MacBook**, the traffic comes from your trusted residential IP address. Your internet connection proves you are a real user, allowing the bot to bypass the firewall completely.

## Setup Instructions for Mac

### 1. Requirements
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Install Dependencies
Open your terminal, navigate to this project directory, and install the required packages:

```bash
cd /Users/dilipnigam/Documents/Naukri
npm install
npx playwright install chromium --with-deps
```

### 3. Create the Run Script
To securely run the bot without constantly typing out your password, create an executable file named `run_update.sh`. (Note: This file is intentionally ignored by GitHub so your password stays locally and safely on your Mac!)

Create a file named `run_update.sh` in the project root:
```bash
#!/bin/bash

# Your Naukri Configuration
export NAUKRI_EMAIL="your_email@gmail.com"
export NAUKRI_PASSWORD="your_password"

# Set HEADLESS=false if you want the Chromium browser to visibly pop up
export HEADLESS=true

# Navigate to the folder (needed for scheduled tasks to work correctly)
cd /Users/dilipnigam/Documents/Naukri

# Run the profile updater invisibly and log the output
node update_profile.js >> cron_log.txt 2>&1
```

Make your new script executable:
```bash
chmod +x run_update.sh
```

### 4. Run it Manually
You can test the bot entirely locally anytime you want by just typing:
```bash
./run_update.sh
```

### 5. Automate It Forever (Background Cron Job)
You can command your Mac to execute `run_update.sh` automatically (every hour between 9 AM and 5 PM daily) completely invisibly in the background.

1. Open your Mac Terminal.
2. Type `crontab -e` and press Enter.
3. This opens a text editor. Press the letter `i` on your keyboard to enter "Insert Mode".
4. Copy and paste the following line:
   ```bash
   0 9-17 * * * /Users/dilipnigam/Documents/Naukri/run_update.sh
   ```
5. Press the `Esc` key.
6. Type `:wq` and press `Enter` to save and quit.

### How it works
Your Mac will now automatically run the script every hour on the hour between 9 AM and 5 PM. (If your laptop lid is completely closed and it is sleeping during the scheduled time, it will simply skip that hour and run at the next scheduled time when you open your laptop). All activity logs will be quietly saved into `cron_log.txt`.
