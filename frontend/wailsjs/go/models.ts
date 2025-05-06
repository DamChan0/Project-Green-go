export namespace main {
	
	export class SystemInfo {
	    cpu_usage_per_thread: number[];
	    cpu_usage_average: number;
	    memory_usage_percent: number;
	    memory_total_gb: number;
	    memory_used_gb: number;
	    disk_usage_percent: number;
	    disk_total_gb: number;
	    disk_used_gb: number;
	
	    static createFrom(source: any = {}) {
	        return new SystemInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpu_usage_per_thread = source["cpu_usage_per_thread"];
	        this.cpu_usage_average = source["cpu_usage_average"];
	        this.memory_usage_percent = source["memory_usage_percent"];
	        this.memory_total_gb = source["memory_total_gb"];
	        this.memory_used_gb = source["memory_used_gb"];
	        this.disk_usage_percent = source["disk_usage_percent"];
	        this.disk_total_gb = source["disk_total_gb"];
	        this.disk_used_gb = source["disk_used_gb"];
	    }
	}

}

