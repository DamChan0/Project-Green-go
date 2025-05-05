export namespace main {
	
	export class SystemInfo {
	    cpu_usage: number[];
	    memory_usage: number;
	    disk_usage: number;
	
	    static createFrom(source: any = {}) {
	        return new SystemInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpu_usage = source["cpu_usage"];
	        this.memory_usage = source["memory_usage"];
	        this.disk_usage = source["disk_usage"];
	    }
	}

}

