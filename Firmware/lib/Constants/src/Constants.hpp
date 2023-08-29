#include <Arduino.h>
#include <list>

#ifndef Esp32_Main_Constants
#define Esp32_Main_Constants

#define PrefConfig

struct station
{
  String ssid;
  String password;
};

extern struct station StationAP;
extern std::list<String> networkList;
static int WifiStats = 0;

// All GPIO Pins list
static std::list<int> GPIOList = {1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 34, 35, 36, 39};

static const char* ca_cert = \
"-----BEGIN CERTIFICATE-----\n"\
"MIIB2TCCAYCgAwIBAgIJALioY+UlgNx7MAoGCCqGSM49BAMCMGAxLTArBgNVBAMM\n"\
"JEJpdGRlZmVuZGVyIFBlcnNvbmFsIENBLjAwMDAwMDAwMDAwMDEMMAoGA1UECwwD\n"\
"SURTMRQwEgYDVQQKDAtCaXRkZWZlbmRlcjELMAkGA1UEBhMCVVMwHhcNMDkxMjMx\n"\
"MjAwMDAwWhcNMzMwNjA3MDc0NzQ2WjBgMS0wKwYDVQQDDCRCaXRkZWZlbmRlciBQ\n"\
"ZXJzb25hbCBDQS4wMDAwMDAwMDAwMDAxDDAKBgNVBAsMA0lEUzEUMBIGA1UECgwL\n"\
"Qml0ZGVmZW5kZXIxCzAJBgNVBAYTAlVTMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD\n"\
"QgAE3roQmmUz1TyBn/ox7FjOonOr05rQ5E4jlO5VeE6gcoYFbuCQ0RfLR6lDfYYv\n"\
"h4gvqY3w1PvqI1azdO6UnD1yZaMjMCEwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8B\n"\
"Af8EBAMCAQYwCgYIKoZIzj0EAwIDRwAwRAIgfF1aBK/5rrJkznGJyYFAow/t3ryL\n"\
"TWVChY9UqWUyQxMCIDcgUMt8U1lytnxf6Axa4NYD1H5d7x5O9EhpHcHruwPq\n"\
"-----END CERTIFICATE-----\n";

#endif