/* TrueCrypt AutoMount - Automatic mount script for TrueCrypt using key files
 * Copyright (c) 2009  Aliasgar Lokhandwala <dimension7@users.sourceforge.net>
 * http://www.alilokhandwala.co.cc
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

// Version: 1.0
// Host OSes: Vista, XP Service Pack 2
// Minimum TrueCrypt version: 6.0
 
// .::: Config :::.

// You MUST configure this script before use. 
// See http://code.google.com/p/truecryptautomount 
// for configuration option explanations.

var prog_name = "AutoMount";
var tc_path = "C:\\Program Files (x86)\\TrueCrypt\\TrueCrypt.exe";
var drive = "D:";
var partition = "\\Device\\Harddisk0\\Partition4";

var auth_files = new Array(4);
auth_files[0] = "e:\\auth.yellow";
auth_files[1] = "f:\\auth.yellow";
auth_files[2] = "g:\\auth.yellow";
auth_files[3] = "h:\\auth.yellow";

var control_accounts = false;
var super_admin = "administrator";
var users = new Array(1);
users[0] = "username";

// .::: Code Guidelines :::.

// 1. Do NOT use tabs for indentation. Use 4 spaces.
// 2. ONLY use windows line-end characters.

// .::: Globals :::.

var fso = new ActiveXObject("Scripting.FileSystemObject");
var wshShell = new ActiveXObject("WScript.Shell");
var script_args = WScript.Arguments;
var tc_args = " /v " + partition + " /p \"\" /l " + drive + " /c n /h n /q /k ";

// .::: Main :::.

if (!fso.FileExists(tc_path)){
    wshShell.LogEvent(1, prog_name+": Unable to locate " + tc_path); 
    enable_super_admin();
}else{
    if(!fso.DriveExists(drive)){
        var auth_done = false;
        enable_users("no");
        do{
            for(index in auth_files){
                if(fso.FileExists(auth_files[index])){
                    
                    var oExec = wshShell.Exec(tc_path+tc_args+auth_files[index]);
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
