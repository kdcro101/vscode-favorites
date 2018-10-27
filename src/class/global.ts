import { Subject } from "rxjs";

export class Global {
public static eventDeactivate = new Subject<void>();
}
