{{- define "react-ui.name" -}}
{{ .Chart.Name }}
{{- end }}

{{- define "react-ui.fullname" -}}
{{ printf "%s-%s" .Release.Name .Chart.Name }}
{{- end }}
