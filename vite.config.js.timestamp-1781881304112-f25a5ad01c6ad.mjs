// vite.config.js
import { defineConfig } from "file:///sessions/tender-relaxed-cray/mnt/controllerHub/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/tender-relaxed-cray/mnt/controllerHub/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///sessions/tender-relaxed-cray/mnt/controllerHub/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  server: {
    port: 5173,
    strictPort: true
    // sempre usa a 5173 (falha em vez de mudar de porta)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/icon.svg"],
      manifest: {
        name: "controllerHub",
        short_name: "controllerHub",
        description: "Grave, converta \xE1udio em texto e gere relat\xF3rios inteligentes",
        theme_color: "#111111",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "icons/icon.svg",
            sizes: "192x192 512x512",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: "icons/icon.svg",
            sizes: "192x192 512x512",
            type: "image/svg+xml",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"]
      },
      devOptions: {
        // Desligado em dev: o service worker interfere nas requisições do Firestore.
        enabled: false
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvdGVuZGVyLXJlbGF4ZWQtY3JheS9tbnQvY29udHJvbGxlckh1YlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Nlc3Npb25zL3RlbmRlci1yZWxheGVkLWNyYXkvbW50L2NvbnRyb2xsZXJIdWIvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3Nlc3Npb25zL3RlbmRlci1yZWxheGVkLWNyYXkvbW50L2NvbnRyb2xsZXJIdWIvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLCAvLyBzZW1wcmUgdXNhIGEgNTE3MyAoZmFsaGEgZW0gdmV6IGRlIG11ZGFyIGRlIHBvcnRhKVxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLnN2ZycsICdpY29ucy9pY29uLnN2ZyddLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ2NvbnRyb2xsZXJIdWInLFxuICAgICAgICBzaG9ydF9uYW1lOiAnY29udHJvbGxlckh1YicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnR3JhdmUsIGNvbnZlcnRhIFx1MDBFMXVkaW8gZW0gdGV4dG8gZSBnZXJlIHJlbGF0XHUwMEYzcmlvcyBpbnRlbGlnZW50ZXMnLFxuICAgICAgICB0aGVtZV9jb2xvcjogJyMxMTExMTEnLFxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnaWNvbnMvaWNvbi5zdmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyIDUxMng1MTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdpY29ucy9pY29uLnN2ZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTIgNTEyeDUxMicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2Uvc3ZnK3htbCcsXG4gICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgd29ya2JveDoge1xuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsc3ZnLHBuZyxpY299J10sXG4gICAgICB9LFxuICAgICAgZGV2T3B0aW9uczoge1xuICAgICAgICAvLyBEZXNsaWdhZG8gZW0gZGV2OiBvIHNlcnZpY2Ugd29ya2VyIGludGVyZmVyZSBuYXMgcmVxdWlzaVx1MDBFN1x1MDBGNWVzIGRvIEZpcmVzdG9yZS5cbiAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1QsU0FBUyxvQkFBb0I7QUFDNVYsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUV4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUE7QUFBQSxFQUNkO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsZUFBZSxnQkFBZ0I7QUFBQSxNQUMvQyxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxjQUFjLENBQUMsZ0NBQWdDO0FBQUEsTUFDakQ7QUFBQSxNQUNBLFlBQVk7QUFBQTtBQUFBLFFBRVYsU0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
