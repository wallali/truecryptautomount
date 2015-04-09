TrueCrypt Auto-Mount
====================


This project provides a [windows script host](http://msdn.microsoft.com/en-us/library/9bbdkx3k%28VS.85%29.aspx) [JScript](http://msdn.microsoft.com/en-us/library/hbxc2t98%28VS.85%29.aspx) which allows using [TrueCrypt](http://www.truecrypt.org/) [key file](http://www.truecrypt.org/docs/?s=keyfiles) encrypted drives to be automatically and transparently mounted when a USB stick with the correct key file is inserted.

In order for this script to work the drive to be mounted must be encrypted using a key file rather than a password. When using key files in TrueCrypt the password field becomes optional and can be left blank.


What the script does in a nutshell
----------------------------------
The script checks to see if any key files mentioned in the configuration section are available and attempts to mount the encrypted partition using the key file. If the key file is not available the script waits for a while and tries searching for the keyfile again, indefinitely. Once the key file becomes available the script will launch TrueCrypt with the correct [command-line options](http://www.truecrypt.org/docs/command-line-usage) to mount the requested drive letter and quit. The script does not communicate with the user at any time, it logs events in the [windows event](http://windows.microsoft.com/en-us/windows-vista/What-information-appears-in-event-logs-Event-Viewer) application log.


Potential uses of this script
-----------------------------
- You have a encrypted non-system partition that stores windows user profiles and you want it to be mounted at startup before a user attempts to logon provided a USB stick with the correct key file is inserted.
- You have an optional encrypted disk drive that you want to mount automatically when a user inserts a USB stick with the correct key file.


Configuration
-------------
The script must be configured before it can be used. The configuration is saved at the beginning of the script file itself. Open the script file in a text editor to edit the configuration. One instance of the script can mount only one encrypted disk. You can run multiple instances if you wish to mount additional disks.

* prog_name - The name of the program as you want it to appear in windows event log files.
* tc_path - Path to the TrueCrypt executable on your system. **Use \\\\ as the file separator not \\.**
* drive - Drive letter to use when mounting your encrypted partition/disk. Must be an unused drive letter. If the drive letter to be mounted is already in use the script will assume the drive is already mounted and do nothing and quit.
* partition - Path to the encrypted partition/disk to be mounted. **Use \\\\ as the file separator not \\**.
* auth_files array - Specify the potential path and name of the key file. The script will look in all these locations to find the key file. The drives mentioned here may not actually exist at all times. This is OK. You must specify potential drives which your OS will create when you insert a USB stick. **Remember to change the size of the array to match the number of entries in line _new Array(4)_.**

* control_accounts - If windows user profiles are stored on the encrypted partition these MUST be mounted before the user can log in and you may want to enable this option. The effect is that unless the correct key file is inserted, the user accounts mentioned will be disabled. Once the disk containing the correct keyfile is inserted, the script will mount the disk and if successful enable the mentioned user accounts. **The script MUST be run with administrator privileges for it to be able to control user accounts.**
    * super_admin - This works only if control_accounts is enabled. In case of an issue with mounting the disk despite the correct keyfile being supplied, the script will enable this account as a fall back, so you can log in and fix the issue. The profile for this account must be located on a non encrypted local disk.
    * users array - This works only if control_accounts is enabled. The list of local usernames for whom accounts are to be enabled/disabled as explained before. **Remember to change the size of the array to match the number of entries in line _new Array(1)_.**

* dummy_container - Windows assigns the first available drive letter to an inserted USB disk device. This can cause problems if windows assigns the drive letter you intended to use for your encrypted partition/disk to the USB device containing the key file. To avoid this, the script can be given an empty TrueCrypt file container which it will mount in place of the actual encrypted partition/disk and then wait for the key file.
    * dummy_pass - The password to use when mounting the dummy container. This is specified as plain text as the container is empty and does not contain any valuable information.


Running the script
------------------
To be useful the script must be run at windows startup. The script will continue to run in the background until it completes the mount. The .js extension is treated as executable by windows and the script is usually interpreted and run by [wscript.exe](http://support.microsoft.com/kb/232211).

The simplest way to run the script at startup is to put a link to the script in the [startup folder](http://windows.microsoft.com/en-US/windows7/Run-a-program-automatically-when-Windows-starts). But if this is done the script will not run until after the user logs on. This can be used if the encrypted drive to be mounted is an optional disk drive and the user must insert a USB stick with the correct key to use the encrypted disk drive after logging in.

If mounting the encrypted disk is required to be done prior to user logon, the best way to run the script is via the [Windows Vista Task Scheduler](http://windows.microsoft.com/en-US/windows-vista/Automate-tasks-with-Task-Scheduler-from-Windows-Vista-Inside-Out). The script must be _triggered_ at _System Startup_ and must be allowed to run without stopping. It must be run as the _SYSTEM_ user. If you have enabled **control_accounts** in the script configuration, then tick the box _Run with highest privileges_ in the scheduled task config. It is important to get the options right for the task scheduler so that the script continues to run based on your requirements. A sample task is provided to help you get started.

NOTE: Windows XP does not have a task scheduler as powerful as Vista. It may be possible to use the [group policy editor](http://support.microsoft.com/kb/307882) and set this as a [start-up script](http://support.microsoft.com/kb/198642).


License
-------
This script is released under the [GPL v3](https://www.gnu.org/licenses/gpl.html).


Similar/Related Programs
------------------------
Some other open-source programs do things similar to this script.

* [TC Wrapper](http://sourceforge.net/projects/tc-wrapper/)
* [UKey](http://sourceforge.net/projects/ukey/)
