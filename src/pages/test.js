// Updated parts selection logic - Replace the existing Autocomplete section with this:

{/* Parts Selection - Updated to prevent duplicate selection */}
<Box sx={{ mb: 3 }}>
  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
    Select Parts from Inventory (Optional)
  </Typography>
  
  {isLoadingInventory ? (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      py: 2 
    }}>
      <CircularProgress size={20} />
      <Typography sx={{ ml: 2 }}>
        Loading parts...
      </Typography>
    </Box>
  ) : (
    <Autocomplete
      fullWidth
      options={inventoryParts.filter(part => {
        // Filter out parts that are already selected
        const isAlreadySelected = selectedParts.some(selectedPart => selectedPart._id === part._id);
        const hasAvailableStock = getAvailableQuantity(part._id) > 0;
        return !isAlreadySelected && hasAvailableStock;
      })}
      getOptionLabel={(option) => 
        `${option.partName} (${option.partNumber || 'N/A'}) - ₹${option.pricePerUnit || 0} | GST: ${option.gstPercentage || option.taxAmount || 0}% | Available: ${getAvailableQuantity(option._id)}`
      }
      value={null} // Always null to prevent showing selected value
      onChange={(event, newValue) => {
        if (newValue) {
          // Check if part is already selected
          const isAlreadySelected = selectedParts.some(selectedPart => selectedPart._id === newValue._id);
          
          if (isAlreadySelected) {
            setSnackbar({
              open: true,
              message: `"${newValue.partName}" is already selected. You can update its quantity in the selected parts list.`,
              severity: 'warning'
            });
            return;
          }

          // Add the new part with default quantity 1
          const newPartWithQuantity = {
            ...newValue,
            selectedQuantity: 1
          };
          
          setSelectedParts(prev => [...prev, newPartWithQuantity]);
          
          setSnackbar({
            open: true,
            message: `"${newValue.partName}" added to selection.`,
            severity: 'success'
          });
        }
      }}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={500}>
              {option.partName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Part : {option.partNumber || 'N/A'} | 
              Price: ₹{option.pricePerUnit || 0} | 
              GST: {option.gstPercentage || option.taxAmount || 0}| 
              Available: {getAvailableQuantity(option._id)} | 
              {option.carName} - {option.model}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search and add parts (one at a time)"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <InventoryIcon color="action" />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText={
        inventoryParts.filter(part => getAvailableQuantity(part._id) > 0).length === 0 
          ? "No parts available in stock"
          : "No new parts available (all in-stock parts are already selected)"
      }
      filterOptions={(options, { inputValue }) => {
        return options.filter(option => 
          getAvailableQuantity(option._id) > 0 && (
            option.partName.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.partNumber?.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.carName?.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.model?.toLowerCase().includes(inputValue.toLowerCase())
          )
        );
      }}
    />
  )}

  {/* Display information about selection */}
  {selectedParts.length > 0 && (
    <Box sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
      <Typography variant="caption" color="info.dark">
        ℹ️ To prevent duplicates, each part can only be selected once. Use the quantity controls below to adjust amounts.
      </Typography>
    </Box>
  )}

  {/* Selected Parts with Enhanced Quantity Management */}
  {selectedParts.length > 0 && (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Selected Parts with Details ({selectedParts.length}):
      </Typography>
      <List dense>
        {selectedParts.map((part, partIndex) => {
          const selectedQuantity = part.selectedQuantity || 1;
          const quantity = part.quantity;
          const unitPrice = part.pricePerUnit || 0;
          const gstPercentage = part.taxAmount || 0;
          const totalTax = (gstPercentage * selectedQuantity) / quantity;
          const totalPrice = unitPrice * selectedQuantity;
          const gstAmount = (totalPrice * gstPercentage) / 100;
          const finalPrice = totalPrice + totalTax;
          
          // Get available quantity considering all current selections
          const availableQuantity = getAvailableQuantity(part._id);
          
          // Calculate the maximum quantity user can select
          const maxSelectableQuantity = availableQuantity + selectedQuantity;
          const isMaxQuantityReached = selectedQuantity >= maxSelectableQuantity;

          return (
            <ListItem 
              key={part._id} 
              sx={{ 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 1, 
                mb: 1,
                py: 1,
                flexDirection: 'column',
                alignItems: 'stretch',
                bgcolor: 'background.paper'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {part.partName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Part #: {part.partNumber || 'N/A'} | {part.carName} - {part.model}
                  </Typography>
                  <Typography variant="caption" color={availableQuantity > 0 ? 'success.main' : 'error.main'} sx={{ display: 'block' }}>
                    Available Stock: {availableQuantity}
                  </Typography>
                  <Typography variant="caption" color="info.main" sx={{ display: 'block' }}>
                    Max Selectable: {maxSelectableQuantity} | Selected: {selectedQuantity}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newQuantity = selectedQuantity - 1;
                        if (newQuantity >= 1) {
                          handlePartQuantityChange(partIndex, newQuantity, selectedQuantity);
                        }
                      }}
                      disabled={selectedQuantity <= 1}
                      sx={{ 
                        minWidth: '24px', 
                        width: '24px', 
                        height: '24px',
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Typography variant="caption" fontWeight="bold">-</Typography>
                    </IconButton>
                    <TextField
                      size="small"
                      type="number"
                      label="Qty"
                      value={selectedQuantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 1;
                        const oldQuantity = selectedQuantity;
                        
                        // Validate quantity limits
                        if (newQuantity < 1) {
                          return;
                        }
                        
                        if (newQuantity > maxSelectableQuantity) {
                          setError(`Cannot select more than ${maxSelectableQuantity} units of "${part.partName}"`);
                          return;
                        }

                        handlePartQuantityChange(partIndex, newQuantity, oldQuantity);
                      }}
                      inputProps={{ 
                        min: 1, 
                        max: maxSelectableQuantity,
                        style: { width: '50px', textAlign: 'center' },
                        readOnly: isMaxQuantityReached && selectedQuantity === maxSelectableQuantity
                      }}
                      sx={{ 
                        width: '70px',
                        '& .MuiInputBase-input': {
                          textAlign: 'center',
                          fontSize: '0.875rem'
                        }
                      }}
                      error={availableQuantity === 0}
                      disabled={maxSelectableQuantity === 0}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newQuantity = selectedQuantity + 1;
                        if (newQuantity <= maxSelectableQuantity) {
                          handlePartQuantityChange(partIndex, newQuantity, selectedQuantity);
                        } else {
                          setError(`Cannot select more than ${maxSelectableQuantity} units of "${part.partName}"`);
                        }
                      }}
                      disabled={selectedQuantity >= maxSelectableQuantity || availableQuantity === 0}
                      sx={{ 
                        minWidth: '24px', 
                        width: '24px', 
                        height: '24px',
                        border: `1px solid ${selectedQuantity >= maxSelectableQuantity ? theme.palette.error.main : theme.palette.divider}`,
                        color: selectedQuantity >= maxSelectableQuantity ? 'error.main' : 'inherit'
                      }}
                    >
                      <Typography variant="caption" fontWeight="bold">+</Typography>
                    </IconButton>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handlePartRemoval(partIndex)}
                    title="Remove part from selection"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              {/* Price Details */}
              <Box sx={{ 
                mt: 1, 
                p: 1, 
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)', 
                borderRadius: 1 
              }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Price/Unit: ₹{unitPrice.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">
                      GST: {gstPercentage}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="caption" fontWeight={600} color="primary">
                      Total: ₹{finalPrice.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </ListItem>
          );
        })}
      </List>
    </Box>
  )}
</Box>