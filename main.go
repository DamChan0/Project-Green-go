package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp() // app.go에 정의된 NewApp() 함수

	// Create application with options
	appOptions := &options.App{ // 포인터로 옵션 생성
		Title:  "PCMonitor",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup, // app.go의 startup 메서드
		Bind: []interface{}{
			app, // App 인스턴스 바인딩
		},
		// OnStartup 콜백에서 context를 사용하려면 추가
		EnableDefaultContextMenu: true, // 필요하다면 추가 옵션
	}

	// Create 앱 실행 - 옵션을 전달
	// Run Wails 앱 - 옵션을 전달
	err := wails.Run(appOptions) // <-- Run 함수 호출 확인
	if err != nil {
		println("Error running Wails app:", err.Error())
	}
}
