import ftplib

user, password = 'HIHT_FTP_User', 0000
host = '192.168.0.17'
print('ftp')
with ftplib.FTP(host, 21) as ftp:
	ftp.connect(user, password)
	upload_file = open('SPC20220811.log')
	ftp.storbinary('STOR ./', upload_file)
	upload_file.close()

# with FTP(
# 		conf_settings.FTP_DOMAIN,
# 		conf_settings.FTP_USER,
# 		conf_settings.FTP_PASSWORD
# ) as ftp:
# 	with open(os.path.join(folder, filename), 'rb') as file:
# 		ftp.storbinary(f'STOR {filename}', file)
True