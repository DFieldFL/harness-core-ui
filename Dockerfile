FROM nginx:alpine

COPY dist /opt/nextgenui
COPY scripts/nginx.conf /etc/nginx/

WORKDIR /opt/nextgenui

# for on-prem
RUN addgroup -S 101 && adduser -S 101 -G 101
RUN chown -R 101:101 /opt/ /tmp
RUN chmod 700 -R /opt
RUN chmod 700 -R /tmp
USER 101
# end on-prem


EXPOSE 8080

CMD sed -i "s|<\!-- apiurl -->|<script>window.apiUrl = '$API_URL'</script>|" index.html && \
sed -i "s|HARNESS_ENABLE_NG_AUTH_UI_PLACEHOLDER|$HARNESS_ENABLE_NG_AUTH_UI_PLACEHOLDER|" index.html && \
sed -i "s|HARNESS_ENABLE_FULL_STORY_PLACEHOLDER|$HARNESS_ENABLE_FULL_STORY_PLACEHOLDER|" index.html && \
sed -i "s|HARNESS_ENABLE_APPDY_EUM_PLACEHOLDER|$HARNESS_ENABLE_APPDY_EUM_PLACEHOLDER|" index.html && \
sed -i "s|<\!-- segmentToken -->|<script>window.segmentToken = '$SEGMENT_TOKEN'</script>|" index.html && \
sed -i "s|<\!-- bugsnagToken -->|<script>window.bugsnagToken = '$BUGSNAG_TOKEN'</script>|" index.html && \
sed -i "s|<\!-- appDyEUMToken -->|<script>window.appDyEUMToken = '$APPDY_EUM_TOKEN'</script>|" index.html && \
sed -i "s|<\!-- deploymentType -->|<script>window.deploymentType = '$DEPLOYMENT_TYPE'</script>|" index.html && \
if [ "$CDN" = "1" ]; then sed -i "s|\"static\/main\.\(.*\)\.js\"|\"$HARNESS_NG_CDN_PATH_PLACEHOLDER/main.\1.js\"|" index.html; fi && \
if [ "$CDN" = "1" ]; then sed -i "s|HARNESS_NG_CDN_PATH_PLACEHOLDER|$HARNESS_NG_CDN_PATH_PLACEHOLDER/|" index.html; else sed -i "s|HARNESS_NG_CDN_PATH_PLACEHOLDER||" index.html; fi && \
nginx -c /etc/nginx/nginx.conf -g 'daemon off;'
