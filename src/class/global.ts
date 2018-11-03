import { Subject } from "rxjs";
import * as vscode from "vscode";

export class Global {
public static eventDeactivate = new Subject<void>();
public static statusRegistry: vscode.StatusBarItem  = null;
}
