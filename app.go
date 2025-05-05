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

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx


// TODO: cpu info 구조체 생성
// Memory, Disk, Network, GPU 등등
// SystemInfo 구조체 재정의

// SystemInfo 구조체의 필드 타입을 float64로 변경 (백분율)
type SystemInfo struct {
	CPUUsage    []float64 `json:"cpu_usage"`    // CPU 사용률 (코어별)
	MemoryUsage float64   `json:"memory_usage"` // 메모리 사용률 (%)
	DiskUsage   float64   `json:"disk_usage"`   // 디스크 사용률 (%)
}

func (a *App) GetSystemInfo() (*SystemInfo, error) {
	// CPU 사용률 가져오기 (기존과 동일)
	cpuUsage, err := cpu.Percent(time.Second, true) // 0 = 전체 평균 시간 간격, true = 코어별
	totalCPUUsage := 0.0
	for i, usage := range cpuUsage {
		cpuUsage[i] = usage                                 // 코어별 사용률을 배열에 저장
		fmt.Printf("CPU Core %d Usage: %.2f%%\n", i, usage) // 각 코어별 사용률 출력
		totalCPUUsage += usage                              // 전체 CPU 사용률 계산
	}

	if err != nil {
		log.Printf("Error getting CPU usage: %v", err)
		// 오류 발생 시 빈 값 또는 기본값 반환 고려
		// return nil, err // 또는 빈 구조체 반환
	}

	// 메모리 정보 가져오기
	memInfo, err := mem.VirtualMemory()
	if err != nil {
		log.Printf("Error getting memory info: %v", err)
		// return nil, err
	}
	// 메모리 사용률(%) 가져오기
	memoryUsagePercent := 0.0
	if memInfo != nil {
		memoryUsagePercent = memInfo.UsedPercent
	}

	// 디스크 정보 가져오기 (루트 경로 '/')
	diskInfo, err := disk.Usage("/")
	if err != nil {
		log.Printf("Error getting disk usage: %v", err)
		// return nil, err
	}
	// 디스크 사용률(%) 가져오기
	diskUsagePercent := 0.0
	if diskInfo != nil {
		diskUsagePercent = diskInfo.UsedPercent
	}

	// SystemInfo 구조체에 백분율 값 할당
	systemInfo := SystemInfo{
		CPUUsage:    cpuUsage,
		MemoryUsage: memoryUsagePercent, // <-- UsedPercent 사용
		DiskUsage:   diskUsagePercent,   // <-- UsedPercent 사용
	}

	// 디버깅용 출력 (백분율 확인)
	fmt.Printf("CPU Usage: %.2f%%\n", cpuUsage) // 배열이므로 다른 방식 출력 필요
	fmt.Printf("Memory Usage: %.2f%%\n", systemInfo.MemoryUsage)
	fmt.Printf("Disk Usage: %.2f%%\n", systemInfo.DiskUsage)

	// 에러 처리를 더 견고하게 하려면 각 단계에서 nil 체크 후 반환 필요
	// 여기서는 단순화를 위해 에러 발생 시에도 구조체 반환 (값은 0일 수 있음)
	return &systemInfo, nil // 종합적인 에러 처리가 필요하다면 nil 대신 err 반환 고려
}

// Greet 함수 (기존과 동일)
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
