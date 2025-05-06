package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"     // macOS 옵션
	"github.com/wailsapp/wails/v2/pkg/options/windows" // Windows 옵션
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
		Frameless:                true,
		EnableDefaultContextMenu: true, // 필요하다면 추가 옵션
		Mac: &mac.Options{
			TitleBar:             mac.TitleBarHiddenInset(),    // 타이틀 바 숨기고 트래픽 라이트(닫기/최소화/최대화)를 컨텐츠 영역으로 가져옴
			Appearance:           mac.NSAppearanceNameDarkAqua, // 시스템 다크 모드와 유사하게 (선택 사항)
			WebviewIsTransparent: false,                        // 웹뷰 자체를 투명하게 만들지는 않음 (보통 false)
			WindowIsTranslucent:  false,                        // 창 자체를 반투명하게 만들지는 않음 (보통 false)
			// About 정보 등 기타 mac 옵션 설정 가능
		},
		// Windows 특정 옵션
		Windows: &windows.Options{
			WebviewIsTransparent: false, // 웹뷰 자체를 투명하게 만들지는 않음
			WindowIsTranslucent:  false, // 창 자체를 반투명하게 만들지는 않음
			// Windows 11 스타일의 둥근 모서리 및 그림자 효과를 유지하려면 DisableFramelessWindowDecorations를 false (기본값) 또는 생략
			// DisableFramelessWindowDecorations: false,
		},
	}

	// Create 앱 실행 - 옵션을 전달
	// Run Wails 앱 - 옵션을 전달
	err := wails.Run(appOptions) // <-- Run 함수 호출 확인
	if err != nil {
		println("Error running Wails app:", err.Error())
	}
}
