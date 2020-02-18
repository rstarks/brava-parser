param targetProbeTemp temperature
param doneTemp temperature

step blast:
    when timeSpent(blast) >= 90s then chicken
    heater 0 0 0 100 0 0
step chicken:   
    when timeSpent(chicken) >= 4m30s then sear
    heater 70 0 0 0 0 0 for 20s
    heater 0 60 0 0 0 0 for 10s
    heater 0 0 60 0 0 20 for 10s
step sear:
    when timeSpent(sear) >= 2m25s then finish1
    heater 70 0 0 0 0 0 for 30s
    heater 0 60 0 0 0 0 for 10s
    heater 0 0 60 0 0 20 for 10s
step finish1:
    when timeSpent(finish1) >= 4m then finish2
    heater 70 0 0 0 0 0 for 20s
    heater 0 60 0 0 0 0 for 10s
    heater 0 0 60 0 0 20 for 10s
step finish2:
    when probeTemp >= targetProbeTemp then rest
    when timeSpent(finish2) >= 15m then rest
    heater 70 0 0 0 0 0 for 20s
    heater 0 60 0 0 0 0 for 10s
    heater 0 0 60 0 0 0 for 10s
step rest:
    heater 0 0 0 0 0 0 for 4s
    heater 30 40 30 0 0 0 for 1s
    when probeTemp >= doneTemp then done
    when timeSpent(rest) >= 3m then rest2
step rest2:
    heater 70 0 0 0 0 0 for 30s
    heater off for 10s
    when probeTemp >= doneTemp then done