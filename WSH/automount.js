/* TrueCrypt AutoMount - Automatic mount script for TrueCrypt using key files
 * Copyright (c) 2009  Aliasgar Lokhandwala <ali@huestones.co.uk>
 * http://www.huestones.co.uk
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// .::: Version :::.  

// Version: 2.0
// Host OSes: 7, Vista, XP Service Pack 2
// Minimum TrueCrypt version: 6.0
 
// .::: Config :::.

var prog_name = "ProfileMount";
var tc_path = "C:\\Program Files (x86)\\TrueCrypt\\TrueCrypt.exe";
var drive = "D:";
var partition = "\\Device\\Harddisk0\\Partition4";

var auth_files = new Array(6);
auth_files[0] = "e:\\my.auth";
auth_files[1] = "f:\\my.auth";
auth_files[2] = "g:\\my.auth";
auth_files[3] = "h:\\my.auth";

var control_accounts = true;
var super_admin = "administrator";
var users = new Array(1);
users[0] = "username";

var dummy_container = "c:\\windows\\dummy.fs";
var dummy_pass = "dummy";

// .::: Code Guidelines :::.

// 1. Do NOT use tabs for indentation. Use 4 spaces.
// 2. ONLY use windows line-end characters.

// .::: Globals :::.

var fso = new ActiveXObject("Scripting.FileSystemObject");
var wshShell = new ActiveXObject("WScript.Shell");
var script_args = WScript.Arguments;
var tc_args = " /v " + partition + " /p \"\" /l " + drive + " /c n /h n /q /s /k ";

// .::: Main :::.

if (!fso.FileExists(tc_path)){
    wshShell.LogEvent(1, prog_name+": Unable to locate " + tc_path); 
    enable_super_admin();
}else{
    if(!fso.DriveExists(drive)){
        var auth_done = false;
        var drive_reserved = false;
        
        enable_users("no");
        
        if(fso.FileExists(dummy_container)){
            drive_reserved = reserve_drive_letter();
            if(!drive_reserved){
                wshShell.LogEvent(2, prog_name+": Failed to reserve drive letter: "+drive); 
                enable_super_admin();
            }
        }else{
            wshShell.LogEvent(4, prog_name+": Dummy container not found, will not attempt to reserve drive letter: "+drive); 
        }
        
        do{
            for(index in auth_files){
                if(fso.FileExists(auth_files[index])){
                    if(drive_reserved){
                        drive_reserved = !unmount_drive_letter();
                    }

                    if(!drive_reserved){
                        var oExec = wshShell.Exec("\"" + tc_path + "\"" + tc_args + "\"" + auth_files[index] + "\"");
                        var status_wait = 1;
                        
                        while (oExec.Status == 0 && (status_wait%10)!=0){
                            
                            WScript.Sleep(1000);
                            status_wait++;
                        }
                        
                        if(oExec.Status == 0){
                            
                            wshShell.LogEvent(2, prog_name+": Mount program did not close."); 
                        }
                        
                        if(fso.DriveExists(drive)){
                            
                            wshShell.LogEvent(0, prog_name+": Drive "+drive+" sucessfully authorized."); 
                            enable_users("yes");
                        }else{
                            
                            wshShell.LogEvent(1, prog_name+": Drive "+drive+" authorization failed."); 
                            enable_super_admin();
                        }
                    }else{
                        wshShell.LogEvent(1, prog_name+": Failed to unmount reserved drive letter: "+drive); 
                        enable_super_admin();
                    }
                    
                    auth_done = true;
                }
            }
                        
            if(!auth_done){
                WScript.Sleep(2000);
            }
            
        }while(!auth_done);
    }else{
        wshShell.LogEvent(4, prog_name+": Drive "+drive+" already exists. Authorization skipped."); 
    }
}

// .::: Functions :::.

function enable_super_admin(){
    if(control_accounts){
        wshShell.Exec("net user "+super_admin+" /active:yes");
    }
}

function enable_users(enable){
    if(control_accounts){
        for(index in users){
            wshShell.Exec("net user "+users[index]+" /active:"+enable);
        }
    }
}

function reserve_drive_letter(){
    var tc_reserve_args = " /v " + dummy_container + " /p \""+dummy_pass+"\" /l " + drive + " /c n /h n /q /s /m ro";

    wshShell.Exec(tc_path+tc_reserve_args);
    WScript.Sleep(3000);
    return fso.DriveExists(drive);
}

function unmount_drive_letter(){
    var tc_unmount_args = " /f /q /s /d " + drive;
    
    wshShell.Exec(tc_path+tc_unmount_args);
    WScript.Sleep(3000);
    if(fso.DriveExists(drive)){
        wshShell.LogEvent(4, prog_name+": Waiting for reserved drive "+drive+" to unmount."); 
        WScript.Sleep(5000);
    }
    
    return !fso.DriveExists(drive);;
}
