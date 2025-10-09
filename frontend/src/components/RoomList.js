import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Centro',
      dataIndex: 'center',
      key: 'center',
    },
    {
      title: 'Capacidad',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'available' ? 'green' : 'red'}>
          {status === 'available' ? 'Disponible' : 'Ocupada'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de eliminar esta sala?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDelete = async (id) => {
    try {
      // Aquí irá la llamada a la API para eliminar la sala
      message.success('Sala eliminada correctamente');
      // Recargar la lista de salas
      fetchRooms();
    } catch (error) {
      message.error('Error al eliminar la sala');
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      // Aquí irá la llamada a la API para obtener las salas
      // Por ahora usamos datos de ejemplo
      setRooms([
        {
          id: 1,
          name: 'Sala de reuniones A',
          center: 'Centro Principal',
          capacity: 10,
          status: 'available',
        },
        {
          id: 2,
          name: 'Auditorio',
          center: 'Centro Principal',
          capacity: 50,
          status: 'available',
        },
      ]);
    } catch (error) {
      message.error('Error al cargar las salas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
        >
          Añadir Sala
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={rooms}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default RoomList;