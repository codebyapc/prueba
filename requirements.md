Feature: Gestión de salas y centros

Scenario: Añadir una sala
  Given que soy un gestor de salas
  When añado una nueva sala a un centro
  Then la sala debe aparecer en la lista de salas del centro

Scenario: Editar una sala
  Given que soy un gestor de salas
  When edito los detalles de una sala existente
  Then los cambios deben reflejarse correctamente en la sala

Scenario: Eliminar una sala
  Given que soy un gestor de salas
  When elimino una sala existente
  Then la sala ya no debe aparecer en la lista del centro

Scenario: Reservar una sala disponible
  Given que soy un empleado
  And la sala está disponible en la fecha y hora seleccionada
  When creo una reserva
  Then la reserva se guarda correctamente
  And no se permite reservar la misma sala en la misma franja horaria

Scenario: Autorizar o rechazar reserva
  Given que soy un gestor de salas
  When reviso una solicitud de reserva
  Then puedo aprobarla o rechazarla
  And el empleado recibe notificación del estado

Scenario: Reagendar una reserva
  Given que soy un gestor de salas
  And existe una reserva conflictiva
  When cambio la sala, fecha u hora de la reserva
  Then la reserva se actualiza correctamente
  And se notifica al empleado
