FROM stephenafamo/adonisjs:1.0.0

# ------------------------------------------
# copy our initilization file and set permissions
# ------------------------------------------
COPY init.sh /app/init.sh
RUN chmod 755 /app/init.sh

CMD ["bash", "/app/init.sh"]
