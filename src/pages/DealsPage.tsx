  // Обработчик нажатия на кнопку "Создать"
  const handleCreate = () => {
    setCurrentDeal(null);
    setFormData({
      title: "",
      clientId: "",
      amount: 0,
      stage: "initial",
      probability: 20,
      expectedCloseDate: new Date().toLocaleDateString('en-CA')
    });
    setFormOpen(true);
  };