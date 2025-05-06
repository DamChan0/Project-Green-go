package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
)

// App struct
type App struct {
	ctx context.Context
}

type SystemInfo struct {
	// CPU 정보
	CPUUsagePerThread []float64 `json:"cpu_usage_per_thread"` // 각 논리 프로세서(스레드)별 CPU 사용률 (%)
	CPUUsageAverage   float64   `json:"cpu_usage_average"`    // 전체 평균 CPU 사용률 (%)
	// TODO: CPU 모델명, 코어 수 등 추가 정보 필요시 필드 추가

	// 메모리(RAM) 정보
	MemoryUsagePercent float64 `json:"memory_usage_percent"` // 사용 중인 RAM 비율 (%)
	MemoryTotalGB      float64 `json:"memory_total_gb"`      // 전체 물리 RAM (GB)
	MemoryUsedGB       float64 `json:"memory_used_gb"`       // 사용 중인 물리 RAM (GB)
	// TODO: 사용 가능(Available), 캐시/버퍼 등 상세 정보 필요시 필드 추가

	// 디스크 정보 (루트 '/' 기준)
	DiskUsagePercent float64 `json:"disk_usage_percent"` // 루트 파티션 사용률 (%)
	DiskTotalGB      float64 `json:"disk_total_gb"`      // 루트 파티션 전체 용량 (GB)
	DiskUsedGB       float64 `json:"disk_used_gb"`       // 루트 파티션 사용 중인 용량 (GB)
	// TODO: 다른 파티션 정보, IO 통계 등 필요시 구조 변경 또는 필드 추가

	// --- TODO: 향후 확장 영역 ---
	// NetworkInfo NetworkStats `json:"network_info"` // 네트워크 정보 구조체
	// GPUInfo     GPUStats     `json:"gpu_info"`     // GPU 정보 구조체
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

const (
	// 바이트를 기가바이트(GB)로 변환하기 위한 상수 (1024 * 1024 * 1024)
	bytesToGB = 1 << 30
)

// TODO: cpu info 구조체 생성
// Memory, Disk, Network, GPU 등등
// SystemInfo 구조체 정의
// GetSystemInfo 함수: 시스템 정보를 수집하여 SystemInfo 구조체로 반환
func (a *App) GetSystemInfo() (*SystemInfo, error) {
	var firstErr error // 첫 번째 발생한 에러를 저장

	// --- CPU 정보 수집 ---
	// CPU 사용률은 측정을 위해 약간의 시간이 필요함 (정확도를 위해)
	interval := time.Second                               // 1초 간격으로 측정
	cpuUsagePerThread, err := cpu.Percent(interval, true) // true: 스레드별 사용률
	if err != nil {
		log.Printf("Error getting per-CPU usage: %v", err)
		cpuUsagePerThread = []float64{} // 에러 시 빈 슬라이스
		if firstErr == nil {
			firstErr = fmt.Errorf("failed to get per-CPU usage: %w", err)
		}
	}

	// cpu.Percent(interval, false)는 요소가 하나인 슬라이스를 반환
	cpuUsageAvgSlice, err := cpu.Percent(interval, false) // false: 전체 평균 사용률
	cpuUsageAverage := 0.0
	if err != nil {
		log.Printf("Error getting average CPU usage: %v", err)
		if firstErr == nil {
			firstErr = fmt.Errorf("failed to get average CPU usage: %w", err)
		}
	} else if len(cpuUsageAvgSlice) > 0 {
		cpuUsageAverage = cpuUsageAvgSlice[0]
	} else {
		log.Printf("Warning: Average CPU usage slice was empty.")
		// 필요하다면 이것도 에러로 처리할 수 있음
		// if firstErr == nil { firstErr = errors.New("average CPU usage data not available") }
	}

	// --- 메모리 정보 수집 ---
	memInfo, err := mem.VirtualMemory()
	memoryUsagePercent := 0.0
	memoryTotalGB := 0.0
	memoryUsedGB := 0.0
	if err != nil {
		log.Printf("Error getting memory info: %v", err)
		if firstErr == nil {
			firstErr = fmt.Errorf("failed to get memory info: %w", err)
		}
	} else if memInfo != nil {
		memoryUsagePercent = memInfo.UsedPercent
		memoryTotalGB = float64(memInfo.Total) / bytesToGB
		memoryUsedGB = float64(memInfo.Used) / bytesToGB
	}

	// --- 디스크 정보 수집 (루트 '/') ---
	// 참고: Windows의 경우 '/' 대신 'C:' 등 주 드라이브 문자를 사용해야 할 수 있음
	//       또는 모든 파티션을 순회하는 로직이 필요할 수 있음
	diskPath := "/" // Linux/macOS 기준 루트 경로
	// TODO: 운영체제별로 경로 조정 로직 추가 고려 (e.g., runtime.GOOS)
	diskInfo, err := disk.Usage(diskPath)
	diskUsagePercent := 0.0
	diskTotalGB := 0.0
	diskUsedGB := 0.0
	if err != nil {
		log.Printf("Error getting disk usage for '%s': %v", diskPath, err)
		if firstErr == nil {
			firstErr = fmt.Errorf("failed to get disk usage for %s: %w", diskPath, err)
		}
	} else if diskInfo != nil {
		diskUsagePercent = diskInfo.UsedPercent
		diskTotalGB = float64(diskInfo.Total) / bytesToGB
		diskUsedGB = float64(diskInfo.Used) / bytesToGB
	}

	// --- TODO: 네트워크 정보 수집 ---
	// netInfo, err := net.IOCounters(false) // false: 전체 합계, true: 인터페이스별
	// if err != nil { ... }
	// networkStats := NetworkStats{ BytesSent: netInfo[0].BytesSent, BytesRecv: netInfo[0].BytesRecv }

	// --- TODO: GPU 정보 수집 ---
	// 별도 라이브러리 (예: nvidia-smi 연동, 특정 벤더 SDK) 필요

	// --- 최종 SystemInfo 구조체 생성 ---
	systemInfo := SystemInfo{
		CPUUsagePerThread:  cpuUsagePerThread,
		CPUUsageAverage:    cpuUsageAverage,
		MemoryUsagePercent: memoryUsagePercent,
		MemoryTotalGB:      memoryTotalGB,
		MemoryUsedGB:       memoryUsedGB,
		DiskUsagePercent:   diskUsagePercent,
		DiskTotalGB:        diskTotalGB,
		DiskUsedGB:         diskUsedGB,
		// TODO: NetworkInfo: networkStats,
		// TODO: GPUInfo: gpuStats,
	}

	// 디버깅용 출력 (선택 사항)
	fmt.Printf("--- Collected System Info ---\n")
	fmt.Printf("CPU Usage (Avg): %.2f%%\n", systemInfo.CPUUsageAverage)
	fmt.Printf("CPU Usage (Per Thread): %d threads\n", len(systemInfo.CPUUsagePerThread))
	// for i, usage := range systemInfo.CPUUsagePerThread {
	// 	fmt.Printf("  Thread %d: %.2f%%\n", i, usage)
	// }
	fmt.Printf("Memory Usage: %.2f%% (Used: %.2f GB / Total: %.2f GB)\n",
		systemInfo.MemoryUsagePercent, systemInfo.MemoryUsedGB, systemInfo.MemoryTotalGB)
	fmt.Printf("Disk Usage ('%s'): %.2f%% (Used: %.2f GB / Total: %.2f GB)\n",
		diskPath, systemInfo.DiskUsagePercent, systemInfo.DiskUsedGB, systemInfo.DiskTotalGB)
	fmt.Println("-----------------------------")

	// 수집 중 발생한 첫 번째 에러를 반환 (에러가 없으면 nil)
	// 에러가 발생했더라도 수집된 부분적인 정보는 함께 반환됨
	return &systemInfo, firstErr
}

// Greet 함수 (기존과 동일)
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
