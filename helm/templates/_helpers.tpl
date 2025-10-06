{{- define "app-ui.name" -}}
{{ .Chart.Name }}
{{- end }}

{{- define "app-ui.fullname" -}}
{{ printf "%s-%s" .Release.Name .Chart.Name }}
{{- end }}
